import { Injectable } from '@nestjs/common';
const PdfPrinter = require('pdfmake');
import { Content, ContentTable, TDocumentDefinitions } from 'pdfmake/interfaces';
import { SlipsheetEntity } from '../../models/bills/serializers/slipsheet.serializer';
import { createWriteStream, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import moment from 'moment';
import { BillEntity } from '../../models/bills/serializers/bill.serializer';
import { OrderEntryEntity } from '../../models/bills/serializers/order-entry.serializer';
import { AnnotationEntity } from '../../models/bills/serializers/annotation.serializer';
import { CompanySettingsService } from '../../models/settings/company-settings.service';
import { CompanySettingsEntity } from '../../models/settings/serializers/company-settings.serializer';

// Fallback-Pfade auf die bestehenden hardcoded Dateien
const FALLBACK_LOGO = join(__dirname, '..', 'pdfAnnotation', 'logo.svg');
const FALLBACK_BADGE1 = join(__dirname, '..', 'pdfAnnotation', 'adler.svg');
const FALLBACK_BADGE2 = join(__dirname, '..', 'pdfAnnotation', 'gdfort.jpg');

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

  private readonly _printer;

  constructor(private readonly settingsService: CompanySettingsService) {
    this._printer = new PdfPrinter(this.fonts);
  }

  public async generateDeliverySlip(slip: SlipsheetEntity): Promise<PDFKit.PDFDocument> {
    const settings = await this.getSettings();
    const docDefinition = await this.buildDocDefinition(settings);
    const content: Array<Content> = [];

    content.push(this.buildHead(slip, slip.printDate, settings));
    content.push({ text: 'Lieferschein #' + slip.slipsheetnumber, style: 'header' });

    const annotation = this.buildSlipAnnotations(slip);
    if (annotation) {
      content.push({ stack: annotation });
    }

    content.push(this.buildOrdersDelivery(slip));
    docDefinition.content = content;

    return this._printer.createPdfKitDocument(docDefinition);
  }

  public async generateBill(bill: BillEntity): Promise<PDFKit.PDFDocument> {
    const settings = await this.getSettings();
    const docDefinition = await this.buildDocDefinition(settings);
    const content: Array<Content> = [];

    content.push(this.buildHead(bill.slipsheets[0], bill.billDate, settings));
    content.push({ text: 'Rechnung #' + bill.billNumber, style: 'header' });
    content.push(this.buildOrders(bill, settings));
    docDefinition.content = content;

    return this._printer.createPdfKitDocument(docDefinition);
  }

  public savePDFToFileSystem(doc: PDFKit.PDFDocument, filepath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.saveStreamtoFileSystem(doc, filepath, (_err, _pages, path) => resolve(path))) {
        reject(new Error('PDF konnte nicht gespeichert werden'));
      }
    });
  }

  public saveStreamtoFileSystem(
    doc: PDFKit.PDFDocument,
    filepath: string,
    cb: Function,
  ): boolean {
    try {
      if (filepath) {
        doc.pipe(createWriteStream(filepath));
        doc.on('end', () => cb(null, null, [filepath]));
        doc.end();
        return true;
      }
    } catch (error) {
      console.error('PdfMakerService.saveStreamtoFileSystem:', error);
    }
    return false;
  }

  private async getSettings(): Promise<CompanySettingsEntity | null> {
    try {
      return await this.settingsService.get();
    } catch {
      return null;
    }
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

  private buildLogoContent(settings: CompanySettingsEntity | null) {
    const logoPath = this.getExistingPath(settings?.logoPath);
    const usePath = logoPath || FALLBACK_LOGO;
    const svg = readFileSync(usePath).toString();

    return { svg, fit: [170, 170], margin: [60, 30, 0, 0] };
  }

  private buildFooterBadge1(settings: CompanySettingsEntity | null): Content {
    const usePath = this.getExistingPath(settings?.badge1Path) || FALLBACK_BADGE1;
    const isSvg = usePath.toLowerCase().endsWith('.svg');
    const base: any = {
      alignment: 'right',
      width: 40,
      margin: [0, 0, 15, 0],
      color: '#e9582a',
    };

    return isSvg
      ? { ...base, svg: readFileSync(usePath).toString() }
      : { ...base, image: usePath };
  }

  private buildFooterBadge2(settings: CompanySettingsEntity | null): Content {
    const usePath = this.getExistingPath(settings?.badge2Path) || FALLBACK_BADGE2;
    const isSvg = usePath.toLowerCase().endsWith('.svg');

    return isSvg
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
      .map((bank) => `${bank.name} · IBAN: ${bank.iban} · BIC: ${bank.bic}`)
      .join(' · ');

    const city = settings?.issueCity ?? 'Landeck';
    const base = `Zahlbar und klagbar in ${city}`;

    return [paymentText, base, bankLines].filter(Boolean).join(' · ');
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

  private async buildDocDefinition(
    settings: CompanySettingsEntity | null,
  ): Promise<TDocumentDefinitions> {
    const self = this;

    return {
      pageOrientation: 'portrait',
      pageMargins: [60, 150, 60, 100],
      header: (() => [
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
      ]) as any,
      footer: (() => [
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
      ]) as any,
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
  ): Content {
    const city = settings?.issueCity ?? 'Landeck';

    return {
      alignment: 'justify',
      margin: [0, 10, 10, 40],
      columns: [
        {
          width: 'auto',
          text: [
            'An\n',
            (slip.customer.companyName || '') + '\n',
            slip.customer.lastName + ' ' + slip.customer.firstName + '\n',
            slip.customer.address + '\n',
            slip.customer.postcode + ' ' + slip.customer.country + '\n',
          ],
        },
        {
          alignment: 'right',
          margin: [0, 60, 0, 0],
          text:
            `${city}, am ${moment(date ?? new Date()).format('DD.MM.YYYY')}` +
            (slip.customer.customerNumber ? '\nKunde: ' + slip.customer.customerNumber : '\n') +
            (slip.customer.uid ? '\nIhre UID: ' + slip.customer.uid : '\nIhre UID:\n'),
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
        widths: [60, 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
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
          text: 'Lieferschein von ' + moment(slip.createdAt).format('DD.MM.YYYY') + ' L' + slip.slipsheetnumber,
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
        const annotationCell = { stack: annotation, colSpan: 6 };
        table.table.body.push(['', annotationCell, '', '', '', '', '', '']);
      }

      for (let i = 0; i < slip.orderEntries.length; i++) {
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
          { text: '€' + el.price.toFixed(2), style: 'tableCell', alignment: 'right' },
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
          { text: '€' + total.toFixed(2), style: 'tableCell', alignment: 'right' },
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
        { text: '€' + sum.toFixed(2), style: 'tableCell', alignment: 'right' },
      ],
      [
        empty,
        empty,
        empty,
        empty,
        { text: vatLabel, colSpan: 2, style: 'tableCell', alignment: 'right' },
        '',
        '',
        { text: '€' + ((sum * vatRate) / 100).toFixed(2), style: 'tableCell', alignment: 'right' },
      ],
      [
        empty,
        empty,
        empty,
        empty,
        { text: 'Gesamt', colSpan: 2, style: 'tableSumHeader', alignment: 'right' },
        '',
        '',
        {
          text: '€' + (sum * (1 + vatRate / 100)).toFixed(2),
          style: 'tableSumHeader',
          alignment: 'right',
        },
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

    for (let i = 0; i < slip.orderEntries.length; i++) {
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
