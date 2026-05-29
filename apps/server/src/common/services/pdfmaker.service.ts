import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import moment from 'moment';
import { PDFDocument } from 'pdf-lib';
const PdfPrinter = require('pdfmake');
import { Content, ContentTable, TDocumentDefinitions } from 'pdfmake/interfaces';
import { AnnotationEntity } from '../../models/bills/serializers/annotation.serializer';
import { BillEntity } from '../../models/bills/serializers/bill.serializer';
import { OrderEntryEntity } from '../../models/bills/serializers/order-entry.serializer';
import { SlipsheetEntity } from '../../models/bills/serializers/slipsheet.serializer';
import { CompanySettingsService } from '../../models/settings/company-settings.service';
import {
  CompanySettingsEntity,
} from '../../models/settings/serializers/company-settings.serializer';
import { LetterheadMode } from '../../models/settings/interfaces/company-settings.interface';

const FALLBACK_LOGO = join(__dirname, '..', 'pdfAnnotation', 'logo.svg');
const FALLBACK_BADGE1 = join(__dirname, '..', 'pdfAnnotation', 'adler.svg');
const FALLBACK_BADGE2 = join(__dirname, '..', 'pdfAnnotation', 'gdfort.jpg');
const HEAD_CLEAR_CM_IN_POINTS = 70;

interface PdfRenderOptions {
  disableLetterhead?: boolean;
}

@Injectable()
export class PdfMakerService {
  private readonly fonts = {
    Courier: {
      normal: 'Courier',
      bold: 'Courier-Bold',
      italics: 'Courier-Oblique',
      bolditalics: 'Courier-BoldOblique',
    },
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    },
    Times: {
      normal: 'Times-Roman',
      bold: 'Times-Bold',
      italics: 'Times-Italic',
      bolditalics: 'Times-BoldItalic',
    },
    Arial: {
      normal: join(__dirname, '..', 'pdfAnnotation', 'fonts', 'arial.ttf'),
      bold: join(__dirname, '..', 'pdfAnnotation', 'fonts', 'arialbd.ttf'),
      italics: join(__dirname, '..', 'pdfAnnotation', 'fonts', 'ariali.ttf'),
      bolditalics: join(__dirname, '..', 'pdfAnnotation', 'fonts', 'arialbi.ttf'),
    },
    Symbol: { normal: 'Symbol' },
    ZapfDingbats: { normal: 'ZapfDingbats' },
  };

  private readonly printer;

  constructor(private readonly settingsService: CompanySettingsService) {
    this.printer = new PdfPrinter(this.fonts);
  }

  public async generateDeliverySlip(
    slip: SlipsheetEntity,
    options: PdfRenderOptions = {},
  ): Promise<Buffer> {
    const settings = await this.getSettings();
    const docDefinition = this.buildDocDefinition(settings, options);
    const content: Array<Content> = [];

    content.push(this.buildHead(slip, slip.printDate, settings));
    content.push({ text: 'Lieferschein #' + slip.slipsheetnumber, style: 'header' });

    const annotation = this.buildSlipAnnotations(slip);
    if (annotation) {
      content.push({ stack: annotation });
    }

    content.push(this.buildOrdersDelivery(slip));
    docDefinition.content = content;

    return this.renderPdfBuffer(docDefinition, settings, options);
  }

  public async generateBill(bill: BillEntity): Promise<Buffer> {
    const settings = await this.getSettings();
    const docDefinition = this.buildDocDefinition(settings);
    const content: Array<Content> = [];

    content.push(this.buildHead(bill.slipsheets[0], bill.billDate, settings, { includeCustomerEmail: true }));
    content.push({ text: 'Rechnung #' + bill.billNumber, style: 'header' });
    content.push(this.buildOrders(bill, settings));
    docDefinition.content = content;

    return this.renderPdfBuffer(docDefinition, settings);
  }

  public async savePDFToFileSystem(pdf: Buffer, filepath: string): Promise<string> {
    await mkdir(dirname(filepath), { recursive: true });
    await writeFile(filepath, pdf);
    return filepath;
  }

  private async renderPdfBuffer(
    docDefinition: TDocumentDefinitions,
    settings: CompanySettingsEntity | null,
    options: PdfRenderOptions = {},
  ): Promise<Buffer> {
    const doc = this.printer.createPdfKitDocument(docDefinition);
    const contentBuffer = await this.toBuffer(doc);

    if (options.disableLetterhead || this.getLetterheadMode(settings) !== 'template_pdf') {
      return contentBuffer;
    }

    return this.mergeWithTemplate(contentBuffer, settings);
  }

  private toBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }

  private async mergeWithTemplate(
    contentBuffer: Buffer,
    settings: CompanySettingsEntity | null,
  ): Promise<Buffer> {
    const templatePath = this.getExistingPath(settings?.templatePdfPath);
    if (!templatePath) {
      return contentBuffer;
    }

    try {
      const contentPdf = await PDFDocument.load(contentBuffer);
      const templateBytes = readFileSync(templatePath);
      const templatePdf = await PDFDocument.load(templateBytes);
      const mergedPdf = await PDFDocument.create();
      const templatePageCount = templatePdf.getPageCount();

      for (let pageIndex = 0; pageIndex < contentPdf.getPageCount(); pageIndex += 1) {
        const contentPage = contentPdf.getPage(pageIndex);
        const { width, height } = contentPage.getSize();
        const targetPage = mergedPdf.addPage([width, height]);
        const templatePageIndex = templatePageCount === 0
          ? -1
          : Math.min(pageIndex, templatePageCount - 1);

        if (templatePageIndex >= 0) {
          const [embeddedTemplatePage] = await mergedPdf.embedPdf(templateBytes, [templatePageIndex]);
          targetPage.drawPage(embeddedTemplatePage, {
            x: 0,
            y: 0,
            width,
            height,
          });
        }

        const [embeddedContentPage] = await mergedPdf.embedPdf(contentBuffer, [pageIndex]);
        targetPage.drawPage(embeddedContentPage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      return Buffer.from(await mergedPdf.save());
    } catch (error) {
      console.error('PdfMakerService.mergeWithTemplate:', error);
      return contentBuffer;
    }
  }

  private async getSettings(): Promise<CompanySettingsEntity | null> {
    try {
      return await this.settingsService.get();
    } catch {
      return null;
    }
  }

  private getLetterheadMode(settings: CompanySettingsEntity | null): LetterheadMode {
    return settings?.letterheadMode ?? 'generated';
  }

  private shouldRenderGeneratedLetterhead(settings: CompanySettingsEntity | null): boolean {
    return this.getLetterheadMode(settings) === 'generated';
  }

  private getExistingPath(filePath: string | null | undefined): string | null {
    if (!filePath) {
      return null;
    }

    const candidates = [filePath, join(process.cwd(), filePath)];
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private isSvg(path: string): boolean {
    return path.toLowerCase().endsWith('.svg');
  }

  private buildLogoContent(settings: CompanySettingsEntity | null): Content {
    const usePath = this.getExistingPath(settings?.logoPath) || FALLBACK_LOGO;

    if (this.isSvg(usePath)) {
      return {
        svg: readFileSync(usePath).toString(),
        fit: [170, 170],
        margin: [60, 30, 0, 0],
      };
    }

    return {
      image: usePath,
      fit: [170, 170],
      margin: [60, 30, 0, 0],
    };
  }

  private buildFooterBadge1(settings: CompanySettingsEntity | null): Content {
    const usePath = this.getExistingPath(settings?.badge1Path) || FALLBACK_BADGE1;
    const base: any = {
      alignment: 'right',
      width: 40,
      margin: [0, 0, 15, 0],
      color: '#e9582a',
    };

    return this.isSvg(usePath)
      ? { ...base, svg: readFileSync(usePath).toString() }
      : { ...base, image: usePath };
  }

  private buildFooterBadge2(settings: CompanySettingsEntity | null): Content {
    const usePath = this.getExistingPath(settings?.badge2Path) || FALLBACK_BADGE2;

    return this.isSvg(usePath)
      ? {
          svg: readFileSync(usePath).toString(),
          width: 40,
          margin: [25, 0, 0, 0],
          color: '#e9582a',
        }
      : { image: usePath, width: 40, margin: [25, 0, 0, 0], color: '#e9582a' };
  }

  private buildFooterText(settings: CompanySettingsEntity | null): string {
    const paymentText =
      settings?.paymentFooterText ??
      `Zahlung innerhalb von ${settings?.paymentTermDays ?? 14} Tagen netto Kassa`;

    const bankLines = (settings?.bankAccounts ?? [])
      .map((bank) => `${bank.name} | IBAN: ${bank.iban} | BIC: ${bank.bic}`)
      .join(' | ');

    const city = settings?.issueCity ?? 'Landeck';
    const base = `Zahlbar und klagbar in ${city}`;

    return [paymentText, base, bankLines].filter(Boolean).join(' | ');
  }

  private buildHeaderStack(settings: CompanySettingsEntity | null): Content[] {
    const lines: Content[] = [];

    if (settings?.street) {
      lines.push({ text: settings.street, style: 'header' });
    }
    if (settings?.zip || settings?.city) {
      lines.push({
        text: `${settings?.zip ?? ''} ${settings?.city ?? ''}`.trim(),
        style: 'header',
      });
    }
    if (settings?.phone) {
      lines.push({ text: ' ', style: 'subheader' });
      lines.push({ text: `Mobile ${settings.phone}`, style: 'subheader' });
    }
    if (settings?.email) {
      lines.push({ text: `E-Mail: ${settings.email}`, style: 'subheader' });
    }
    if (settings?.website) {
      lines.push({ text: settings.website, style: 'subheader' });
    }
    if (settings?.firmenbuchnummer) {
      lines.push({ text: settings.firmenbuchnummer, style: 'subheader' });
    }

    if (lines.length === 0) {
      lines.push(
        { text: 'Fliesserau 384 b', style: 'header' },
        { text: '6500 Landeck', style: 'header' },
        { text: ' ', style: 'subheader' },
        { text: 'Mobile +43 699 10 63 63 45', style: 'subheader' },
        { text: 'E-Mail: office@holz-abler.com', style: 'subheader' },
        { text: 'www.holz-abler.com', style: 'subheader' },
        { text: 'FN.: 303902s, ATU63848368', style: 'subheader' },
      );
    }

    return lines;
  }

  private buildDocDefinition(
    settings: CompanySettingsEntity | null,
    options: PdfRenderOptions = {},
  ): TDocumentDefinitions {
    const self = this;
    const renderGeneratedLetterhead =
      !options.disableLetterhead && this.shouldRenderGeneratedLetterhead(settings);

    return {
      pageOrientation: 'portrait',
      pageMargins: options.disableLetterhead
        ? [60, 60 + HEAD_CLEAR_CM_IN_POINTS, 60, 60]
        : [60, 150, 60, 100],
      header: renderGeneratedLetterhead
        ? (() => [
            {
              columns: [
                self.buildLogoContent(settings),
                {
                  alignment: 'right',
                  margin: [0, 25, 70, 0],
                  stack: self.buildHeaderStack(settings),
                },
              ],
            },
            {
              canvas: [{ type: 'line', x1: 50, y1: 5, x2: 595 - 50, y2: 5, lineWidth: 1 }],
            },
          ]) as any
        : undefined,
      footer: renderGeneratedLetterhead
        ? (() => [
            {
              canvas: [{ type: 'line', x1: 50, y1: 0, x2: 595 - 50, y2: 0, lineWidth: 1 }],
              margin: [0, 30, 0, 5],
            },
            {
              table: {
                widths: [120, '*', 120],
                body: [[
                  self.buildFooterBadge1(settings),
                  { text: self.buildFooterText(settings), style: 'footerText' },
                  self.buildFooterBadge2(settings),
                ]],
              },
              layout: 'noBorders',
            },
          ]) as any
        : undefined,
      content: [],
      styles: this.buildStyles(),
      defaultStyle: { font: 'Arial', fontSize: 12 },
    };
  }

  private buildStyles(): any {
    return {
      header: { fontSize: 12, color: 'black' },
      subheader: { fontSize: 9, color: 'black' },
      footerText: {
        fontSize: 8,
        margin: [0, 10, 0, 0],
        alignment: 'center' as const,
        color: 'black',
      },
      tableExample: { margin: [0, 5, 0, 15] },
      tableHeader: { bold: true, fontSize: 7, color: '#e9582a' },
      tableSum: { color: 'black', bold: true },
      tableSumHeader: { bold: true, fontSize: 10, color: 'black' },
      tableCell: { fontSize: 7 },
      slipCell: { color: '#e9582a' },
      slipAnnotation: { fontSize: 9, color: 'black' },
    };
  }

  private buildHead(
    slip: SlipsheetEntity,
    date: Date | undefined,
    settings: CompanySettingsEntity | null,
    options: { includeCustomerEmail?: boolean } = {},
  ): Content {
    const city = settings?.issueCity ?? 'Landeck';
    const customerEmail = slip.customer.email?.trim();
    const addressLines = [
      'An',
      slip.customer.companyName || '',
      `${slip.customer.lastName} ${slip.customer.firstName}`,
      slip.customer.address,
      `${slip.customer.postcode} ${slip.customer.country}`
    ];
    
    const customerDetailsLines = [
            `${city}, am ${moment(date ?? new Date()).format('DD.MM.YYYY')}`,
            (slip.customer.customerNumber ? 'Kunde: ' + slip.customer.customerNumber : ''),
            (slip.customer.uid ? 'Ihre UID: ' + slip.customer.uid : 'Ihre UID:'),
      ...(options.includeCustomerEmail && customerEmail ? [customerEmail] : []),
    ];

    return {
      alignment: 'justify',
      margin: [0, 10, 10, 40],
      columns: [
        {
          width: 'auto',
          text: addressLines.map((line) => `${line}\n`),
        },
        {
          alignment: 'right',
          margin: [0, 60, 0, 0],
          text: customerDetailsLines.map((line) => `${line}\n`),
        },
      ],
    };
  }

  private buildSlipAnnotations(slip: SlipsheetEntity): Content[] | null {
    const items: Content[] = [];
    slip?.annotations?.forEach((element: AnnotationEntity) => {
      items.push({ text: element.text, style: 'slipAnnotation' });
    });

    return items.length === 0 ? null : items;
  }

  private buildOrders(bill: BillEntity, settings: CompanySettingsEntity | null): Content {
    const vatRate = settings?.vatRate ?? 20;
    const isDiscount = bill.slipsheets.some((cart) =>
      cart.orderEntries.some((order) => order.articleGroupRabatt && order.articleGroupRabatt !== 0),
    );
    const isDiscountSpecial = bill.slipsheets.some((cart) =>
      cart.orderEntries.some((order) => order.customerRabatt && order.customerRabatt !== 0),
    );

    const table: any = {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: [20, 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [[
          { text: 'Pos', style: 'tableHeader', margin: [0, 0, 5, 0] },
          { text: 'Art.Num.', style: 'tableHeader' },
          { text: 'Artikel', style: 'tableHeader' },
          { text: 'Menge', style: 'tableHeader' },
          { text: 'Preis', style: 'tableHeader' },
          { text: isDiscount ? 'Rabatt' : '', style: 'tableHeader' },
          { text: isDiscountSpecial ? 'Sonder\nRabatt' : '', style: 'tableHeader' },
          { text: 'Gesamt', style: 'tableHeader' },
        ]],
      },
      layout: this.getTableDefaultLayout(),
    };

    let sum = 0;

    for (const slip of bill.slipsheets) {
      table.table.body.push([
        '',
        {
          text:
            'Lieferschein von ' +
            moment(slip.createdAt).format('DD.MM.YYYY') +
            ' L' +
            slip.slipsheetnumber,
          colSpan: 6,
          style: 'slipCell',
        },
        '',
        '',
        '',
        '',
        '',
        '',
      ]);

      const annotation = this.buildSlipAnnotations(slip);
      if (annotation) {
        table.table.body.push(['', { stack: annotation, colSpan: 6 }, '', '', '', '', '', '']);
      }

      for (let i = 0; i < slip.orderEntries.length; i += 1) {
        const el: OrderEntryEntity = slip.orderEntries[i];
        const amount = el.amountCounted || el.amount;
        const discount = el.articleGroupRabatt ?? 0;
        const discountSpecial = el.customerRabatt ?? 0;
        const total =
          (amount * el.price * (100 - discount)) / 100 * ((100 - discountSpecial) / 100);

        sum += total;

        table.table.body.push([
          { text: i + 1, style: 'tableCell' },
          { text: el.article?.artNumber ?? '', style: 'tableCell' },
          { text: el.text, style: 'tableCell' },
          { text: amount, style: 'tableCell', alignment: 'right' },
          { text: 'EUR ' + el.price.toFixed(2), style: 'tableCell', alignment: 'right', noWrap: true },
          {
            text: isDiscount ? discount.toFixed(0) + '%' : '',
            style: 'tableCell',
            alignment: 'right',
          },
          {
            text: isDiscountSpecial ? discountSpecial.toFixed(0) + '%' : '',
            style: 'tableCell',
            alignment: 'right',
          },
          { text: 'EUR ' + total.toFixed(2), style: 'tableCell', alignment: 'right', noWrap: true },
        ]);
      }
    }

    const vatLabel = `${vatRate}% MwSt.`;
    const empty = { text: '', border: [0, 0, 0, 0] };

    table.table.body.push(
      [
        empty,
        empty,
        empty,
        empty,
        { text: 'Summe', colSpan: 2, style: 'tableCell', alignment: 'right' },
        '',
        '',
        { text: 'EUR ' + sum.toFixed(2), style: 'tableCell', alignment: 'right' },
      ],
      [
        empty,
        empty,
        empty,
        empty,
        { text: vatLabel, colSpan: 2, style: 'tableCell', alignment: 'right' },
        '',
        '',
        { text: 'EUR ' + ((sum * vatRate) / 100).toFixed(2), style: 'tableCell', alignment: 'right' },
      ],
      [
        empty,
        empty,
        empty,
        empty,
        { text: 'Gesamt', colSpan: 2, style: 'tableSumHeader', alignment: 'right' },
        '',
        {
          text: 'EUR ' + (sum * (1 + vatRate / 100)).toFixed(2),
          style: 'tableSumHeader',
          colSpan: 2,
          alignment: 'right',
        },
        empty,
      ],
    );

    return table;
  }

  private buildOrdersDelivery(slip: SlipsheetEntity): Content {
    const table: ContentTable = {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: [100, '*', '*', 'auto'],
        body: [[
          { text: 'Pos', style: 'tableHeader', margin: [0, 0, 5, 0] },
          { text: 'Artikel', style: 'tableHeader' },
          { text: 'Typ', style: 'tableHeader' },
          { text: 'Menge', style: 'tableHeader' },
        ]],
      },
      layout: this.getSlipTableLayout(),
    };

    for (let i = 0; i < slip.orderEntries.length; i += 1) {
      const el = slip.orderEntries[i];
      table.table.body.push([
        { text: i + 1, style: 'tableCell' },
        { text: el.text, style: 'tableCell' },
        { text: el.article?.artNumber ?? '', style: 'tableCell' },
        { text: el.amount, style: 'tableCell' },
      ]);
    }

    table.table.body.push(['', '', '', '']);
    return table;
  }

  private getTableDefaultLayout() {
    return {
      hLineWidth: (i: number, node: any) => {
        if (i === 0) {
          return 0;
        }
        if (i === node.table.body.length) {
          return 2;
        }
        if (i === node.table.body.length - 1) {
          return 1;
        }
        return 1;
      },
      vLineWidth: () => 0,
      hLineColor: (i: number, node: any) => {
        if (i === node.table.body.length - 3) {
          return 'black';
        }
        return i === 1 || i === node.table.body.length - 1 || i === node.table.body.length
          ? 'black'
          : '#aaa';
      },
      paddingLeft: (i: number) => (i <= 1 ? 0 : 5),
      paddingRight: (i: number, node: any) => (i === node.table.widths.length - 1 ? 0 : 5),
      paddingTop: () => 4,
      paddingBottom: () => 4,
      fillColor: () => null,
    };
  }

  private getSlipTableLayout() {
    return {
      hLineWidth: (i: number, node: any) => {
        if (i === 0) {
          return 0;
        }
        if (i === node.table.body.length) {
          return 2;
        }
        if (i === node.table.body.length - 1) {
          return 1;
        }
        return 1;
      },
      vLineWidth: () => 0,
      hLineColor: (i: number, node: any) =>
        i === 1 || i === node.table.body.length - 1 || i === node.table.body.length
          ? 'black'
          : '#aaa',
      paddingLeft: (i: number) => (i <= 1 ? 0 : 5),
      paddingRight: (i: number, node: any) => (i === node.table.widths.length - 1 ? 0 : 5),
      paddingTop: () => 4,
      paddingBottom: () => 4,
      fillColor: () => null,
    };
  }
}
