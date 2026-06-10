# SIMS — Agent-Anleitung: CompanySettings Feature

> Dieses Dokument ist eine vollständige Schritt-für-Schritt-Anleitung für einen Coding-Agent.
> Jede Phase ist in sich abgeschlossen und testbar. Gib dem Agent immer **eine Phase auf einmal**.

---

## Kontext (vor jeder Phase mitgeben)

```
Repository: github.com/simonabler/sim-system
Branch: first-init
Stack:
  Backend:  NestJS + TypeORM + SQLite (better-sqlite3), Monorepo unter apps/server/
  Frontend: Angular (standalone components, signals, ReactiveFormsModule), unter apps/sim-system/
  PDF-Generierung: pdfmake im Backend, PdfMakerService in apps/server/src/common/services/pdfmaker.service.ts

Ziel dieser Arbeit:
  Alle hardcoded Firmendaten (Adresse, Kontakt, Bankdaten, Logo-Pfade, MwSt-Satz, Ausstellungsort)
  aus dem PdfMakerService in eine konfigurierbare Datenbank-Entity auslagern.
  Eine Angular-Seite /settings ermöglicht die Verwaltung dieser Daten inkl. Logo-Upload.
```

---

## Phase 1 — Backend: CompanySettings Entity + Module

**Prompt für den Agent:**

```
Arbeite im Repository sim-system, Branch first-init.
Erstelle das CompanySettings-Feature im Backend (apps/server/src/).

Orientiere dich beim Code-Stil an den bestehenden Modulen — insbesondere UsersModule und CustomerModule.
Das Muster ist immer: Entity → Interface → Repository → Service → Controller → Module → AppModule.

SCHRITT 1 — Interface
Erstelle die Datei:
  apps/server/src/models/settings/interfaces/company-settings.interface.ts

Inhalt:
export interface ICompanySettings {
  id: number;
  companyName: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  firmenbuchnummer: string | null;
  vatId: string | null;
  issueCity: string | null;
  vatRate: number;
  paymentTermDays: number;
  paymentFooterText: string | null;
  bankAccounts: Array<{ name: string; iban: string; bic: string }>;
  logoPath: string | null;
  badge1Path: string | null;
  badge2Path: string | null;
  updatedAt: Date;
}

---

SCHRITT 2 — Entity
Erstelle die Datei:
  apps/server/src/models/settings/entities/company-settings.entity.ts

Inhalt:
import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { ICompanySettings } from '../interfaces/company-settings.interface';

@Entity({ name: 'company_settings' })
export class CompanySettings implements ICompanySettings {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ nullable: true, default: null })
  companyName: string | null;

  @Column({ nullable: true, default: null })
  street: string | null;

  @Column({ nullable: true, default: null })
  zip: string | null;

  @Column({ nullable: true, default: null })
  city: string | null;

  @Column({ nullable: true, default: 'Österreich' })
  country: string | null;

  @Column({ nullable: true, default: null })
  phone: string | null;

  @Column({ nullable: true, default: null })
  email: string | null;

  @Column({ nullable: true, default: null })
  website: string | null;

  @Column({ nullable: true, default: null })
  firmenbuchnummer: string | null;

  @Column({ nullable: true, default: null })
  vatId: string | null;

  @Column({ nullable: true, default: null })
  issueCity: string | null;

  @Column({ default: 20 })
  vatRate: number;

  @Column({ default: 14 })
  paymentTermDays: number;

  @Column({ nullable: true, default: null, type: 'text' })
  paymentFooterText: string | null;

  @Column({ type: 'simple-json', nullable: true, default: '[]' })
  bankAccounts: Array<{ name: string; iban: string; bic: string }>;

  @Column({ nullable: true, default: null })
  logoPath: string | null;

  @Column({ nullable: true, default: null })
  badge1Path: string | null;

  @Column({ nullable: true, default: null })
  badge2Path: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

---

SCHRITT 3 — Serializer
Erstelle die Datei:
  apps/server/src/models/settings/serializers/company-settings.serializer.ts

Inhalt:
import { Expose } from 'class-transformer';
import { ModelEntity } from '../../../common/serializers/model.serializer';
import { ICompanySettings } from '../interfaces/company-settings.interface';

export const defaultSettingsGroupsForSerializing: string[] = ['default', 'settings.default'];

export class CompanySettingsEntity extends ModelEntity implements ICompanySettings {
  @Expose({ groups: ['default'] }) companyName: string | null;
  @Expose({ groups: ['default'] }) street: string | null;
  @Expose({ groups: ['default'] }) zip: string | null;
  @Expose({ groups: ['default'] }) city: string | null;
  @Expose({ groups: ['default'] }) country: string | null;
  @Expose({ groups: ['default'] }) phone: string | null;
  @Expose({ groups: ['default'] }) email: string | null;
  @Expose({ groups: ['default'] }) website: string | null;
  @Expose({ groups: ['default'] }) firmenbuchnummer: string | null;
  @Expose({ groups: ['default'] }) vatId: string | null;
  @Expose({ groups: ['default'] }) issueCity: string | null;
  @Expose({ groups: ['default'] }) vatRate: number;
  @Expose({ groups: ['default'] }) paymentTermDays: number;
  @Expose({ groups: ['default'] }) paymentFooterText: string | null;
  @Expose({ groups: ['default'] }) bankAccounts: Array<{ name: string; iban: string; bic: string }>;
  @Expose({ groups: ['default'] }) logoPath: string | null;
  @Expose({ groups: ['default'] }) badge1Path: string | null;
  @Expose({ groups: ['default'] }) badge2Path: string | null;
  @Expose({ groups: ['default'] }) updatedAt: Date;
}

---

SCHRITT 4 — DTOs
Erstelle die Datei:
  apps/server/src/models/settings/dto/update-settings.dto.ts

Inhalt:
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BankAccountDto {
  @IsString() name: string;
  @IsString() iban: string;
  @IsString() bic: string;
}

export class UpdateSettingsDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() zip?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() firmenbuchnummer?: string;
  @IsOptional() @IsString() vatId?: string;
  @IsOptional() @IsString() issueCity?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(100) vatRate?: number;
  @IsOptional() @IsNumber() @Min(0) paymentTermDays?: number;
  @IsOptional() @IsString() paymentFooterText?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => BankAccountDto)
  bankAccounts?: BankAccountDto[];
}

---

SCHRITT 5 — Repository
Erstelle die Datei:
  apps/server/src/models/settings/company-settings.repository.ts

Inhalt:
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ModelRepository } from '../model.repository';
import { CompanySettings } from './entities/company-settings.entity';
import {
  CompanySettingsEntity,
  defaultSettingsGroupsForSerializing,
} from './serializers/company-settings.serializer';

@Injectable()
export class CompanySettingsRepository extends ModelRepository<CompanySettings, CompanySettingsEntity> {
  constructor(private dataSource: DataSource) {
    super(CompanySettings, dataSource.createEntityManager());
  }

  transform(model: CompanySettings): CompanySettingsEntity {
    const transformOptions = { groups: defaultSettingsGroupsForSerializing };
    return plainToInstance(
      CompanySettingsEntity,
      instanceToPlain(model, transformOptions),
      transformOptions,
    );
  }

  transformMany(models: CompanySettings[]): CompanySettingsEntity[] {
    return models.map((m) => this.transform(m));
  }
}

---

SCHRITT 6 — Service
Erstelle die Datei:
  apps/server/src/models/settings/company-settings.service.ts

Inhalt:
import { Injectable } from '@nestjs/common';
import { CompanySettingsRepository } from './company-settings.repository';
import { CompanySettingsEntity } from './serializers/company-settings.serializer';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CompanySettings } from './entities/company-settings.entity';

@Injectable()
export class CompanySettingsService {
  constructor(private readonly repo: CompanySettingsRepository) {}

  async get(): Promise<CompanySettingsEntity | null> {
    return this.repo.get(1, [], false);
  }

  async upsert(dto: UpdateSettingsDto): Promise<CompanySettingsEntity> {
    const existing = await this.repo.findOne({ where: { id: 1 } });
    if (existing) {
      return this.repo.updateEntity(1, dto as any);
    }
    const created = await this.repo.save({ id: 1, ...dto } as CompanySettings);
    return this.repo.transform(created);
  }

  async updateLogoPath(field: 'logoPath' | 'badge1Path' | 'badge2Path', path: string): Promise<CompanySettingsEntity> {
    const existing = await this.repo.findOne({ where: { id: 1 } });
    if (existing) {
      return this.repo.updateEntity(1, { [field]: path } as any);
    }
    const created = await this.repo.save({ id: 1, [field]: path } as CompanySettings);
    return this.repo.transform(created);
  }
}

---

SCHRITT 7 — Controller
Erstelle die Datei:
  apps/server/src/models/settings/company-settings.controller.ts

Inhalt:
import {
  Get, Put, Post, Body, Controller,
  UseInterceptors, SerializeOptions, ClassSerializerInterceptor,
  ValidationPipe, UsePipes, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanySettingsService } from './company-settings.service';
import {
  CompanySettingsEntity,
  defaultSettingsGroupsForSerializing,
} from './serializers/company-settings.serializer';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ReS } from '../../common/res.model';

const UPLOAD_DEST = join(process.cwd(), 'uploads', 'settings');

function storageConfig(fieldName: string) {
  return diskStorage({
    destination: UPLOAD_DEST,
    filename: (_req, file, cb) => {
      cb(null, `${fieldName}${extname(file.originalname)}`);
    },
  });
}

@ApiBearerAuth()
@Controller('settings')
@ApiTags('settings')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ groups: defaultSettingsGroupsForSerializing, excludeExtraneousValues: true })
export class CompanySettingsController {
  constructor(private readonly settingsService: CompanySettingsService) {}

  @Get('/')
  @ApiOperation({ summary: 'Einstellungen laden' })
  async get(): Promise<ReS<CompanySettingsEntity>> {
    return ReS.FromData(await this.settingsService.get());
  }

  @Put('/')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Einstellungen speichern' })
  async upsert(@Body() dto: UpdateSettingsDto): Promise<ReS<CompanySettingsEntity>> {
    return ReS.FromData(await this.settingsService.upsert(dto));
  }

  @Post('/logo')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Logo hochladen (SVG oder PNG)' })
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig('logo') }))
  async uploadLogo(@UploadedFile() file: Express.Multer.File): Promise<ReS<CompanySettingsEntity>> {
    const relativePath = join('uploads', 'settings', file.filename);
    return ReS.FromData(await this.settingsService.updateLogoPath('logoPath', relativePath));
  }

  @Post('/badge1')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Badge links hochladen' })
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig('badge1') }))
  async uploadBadge1(@UploadedFile() file: Express.Multer.File): Promise<ReS<CompanySettingsEntity>> {
    const relativePath = join('uploads', 'settings', file.filename);
    return ReS.FromData(await this.settingsService.updateLogoPath('badge1Path', relativePath));
  }

  @Post('/badge2')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Badge rechts hochladen' })
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig('badge2') }))
  async uploadBadge2(@UploadedFile() file: Express.Multer.File): Promise<ReS<CompanySettingsEntity>> {
    const relativePath = join('uploads', 'settings', file.filename);
    return ReS.FromData(await this.settingsService.updateLogoPath('badge2Path', relativePath));
  }
}

---

SCHRITT 8 — Module
Erstelle die Datei:
  apps/server/src/models/settings/company-settings.module.ts

Inhalt:
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { CompanySettingsRepository } from './company-settings.repository';
import { CompanySettingsService } from './company-settings.service';
import { CompanySettingsController } from './company-settings.controller';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanySettings]),
    MulterModule.register({ dest: join(process.cwd(), 'uploads', 'settings') }),
  ],
  controllers: [CompanySettingsController],
  providers: [CompanySettingsRepository, CompanySettingsService],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule {}

---

SCHRITT 9 — AppModule registrieren
Bearbeite die Datei:
  apps/server/src/app.module.ts

Füge den Import von CompanySettingsModule hinzu:
  import { CompanySettingsModule } from './models/settings/company-settings.module';

Und in der imports-Array in @Module:
  CompanySettingsModule,

---

SCHRITT 10 — Static File Serving für Uploads
Bearbeite die Datei:
  apps/server/src/main.ts

Füge nach dem import-Block hinzu:
  import { NestExpressApplication } from '@nestjs/platform-express';
  import { join } from 'path';

Ändere NestFactory.create zu:
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

Füge nach app.enableCors(...) hinzu:
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

---

SCHRITT 11 — Verzeichnis sicherstellen
Erstelle die Datei:
  apps/server/uploads/settings/.gitkeep

(Leere Datei, damit das Verzeichnis im Git landet)

Füge in apps/server/.gitignore (falls vorhanden) hinzu:
  uploads/settings/*
  !uploads/settings/.gitkeep

---

ABSCHLIESSEND: Prüfe ob @nestjs/platform-express und multer als Dependencies vorhanden sind:
  package.json im Root prüfen.
  Falls nicht vorhanden: Hinweis ausgeben dass folgendes installiert werden muss:
    npm install @nestjs/platform-express multer
    npm install --save-dev @types/multer
```

---

## Phase 2 — Backend: PdfMakerService auf Settings umstellen

**Prompt für den Agent:**

```
Arbeite im Repository sim-system, Branch first-init.
Stelle den PdfMakerService auf dynamische CompanySettings um.
Phase 1 (CompanySettingsModule) ist bereits abgeschlossen.

Ziel: Alle hardcoded Firmendaten aus apps/server/src/common/services/pdfmaker.service.ts
entfernen und durch Werte aus CompanySettingsService ersetzen.

---

SCHRITT 1 — SharedModule erweitern
Bearbeite die Datei:
  apps/server/src/common/shared.module.ts

Das Modul muss CompanySettingsModule importieren, damit PdfMakerService auf
CompanySettingsService zugreifen kann.

Füge hinzu:
  import { CompanySettingsModule } from '../models/settings/company-settings.module';

In @Module:
  imports: [AppConfigModule, CompanySettingsModule],

Das ist korrekt weil CompanySettingsModule den CompanySettingsService exportiert.

---

SCHRITT 2 — PdfMakerService komplett ersetzen

Ersetze den gesamten Inhalt von:
  apps/server/src/common/services/pdfmaker.service.ts

Durch folgenden Code:

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
const FALLBACK_LOGO   = join(__dirname, '..', 'pdfAnnotation', 'logo.svg');
const FALLBACK_BADGE1 = join(__dirname, '..', 'pdfAnnotation', 'adler.svg');
const FALLBACK_BADGE2 = join(__dirname, '..', 'pdfAnnotation', 'gdfort.jpg');

@Injectable()
export class PdfMakerService {

  private readonly fonts = {
    Courier: {
      normal: 'Courier', bold: 'Courier-Bold',
      italics: 'Courier-Oblique', bolditalics: 'Courier-BoldOblique',
    },
    Helvetica: {
      normal: 'Helvetica', bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique', bolditalics: 'Helvetica-BoldOblique',
    },
    Times: {
      normal: 'Times-Roman', bold: 'Times-Bold',
      italics: 'Times-Italic', bolditalics: 'Times-BoldItalic',
    },
    Arial: {
      normal:       join(__dirname, '..', 'pdfAnnotation', 'fonts', 'arial.ttf'),
      bold:         join(__dirname, '..', 'pdfAnnotation', 'fonts', 'arialbd.ttf'),
      italics:      join(__dirname, '..', 'pdfAnnotation', 'fonts', 'ariali.ttf'),
      bolditalics:  join(__dirname, '..', 'pdfAnnotation', 'fonts', 'arialbi.ttf'),
    },
    Symbol:       { normal: 'Symbol' },
    ZapfDingbats: { normal: 'ZapfDingbats' },
  };

  private readonly _printer;

  constructor(private readonly settingsService: CompanySettingsService) {
    this._printer = new PdfPrinter(this.fonts);
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  public async generateDeliverySlip(slip: SlipsheetEntity): Promise<PDFKit.PDFDocument> {
    const settings = await this.getSettings();
    const docDefinition = await this.buildDocDefinition(settings);
    const content: Array<Content> = [];
    content.push(this.buildHead(slip, slip.printDate, settings));
    content.push({ text: 'Lieferschein #' + slip.slipsheetnumber, style: 'header' });
    const annotation = this.buildSlipAnnotations(slip);
    if (annotation) content.push(annotation);
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

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private async getSettings(): Promise<CompanySettingsEntity | null> {
    try {
      return await this.settingsService.get();
    } catch {
      return null;
    }
  }

  private readFileSafe(filePath: string | null | undefined, fallback: string): string {
    try {
      if (filePath && existsSync(filePath)) return readFileSync(filePath).toString();
    } catch { /* fall through */ }
    return readFileSync(fallback).toString();
  }

  private readFileBuffer(filePath: string | null | undefined, fallback: string): Buffer {
    try {
      if (filePath && existsSync(filePath)) return readFileSync(filePath);
    } catch { /* fall through */ }
    return readFileSync(fallback);
  }

  private isSvg(path: string | null | undefined): boolean {
    return (path ?? '').toLowerCase().endsWith('.svg');
  }

  private buildLogoContent(settings: CompanySettingsEntity | null) {
    const logoPath = settings?.logoPath ?? null;
    const usePath  = (logoPath && existsSync(logoPath)) ? logoPath : FALLBACK_LOGO;
    const svg      = readFileSync(usePath).toString();
    return { svg, fit: [170, 170], margin: [60, 30, 0, 0] };
  }

  private buildFooterBadge1(settings: CompanySettingsEntity | null): Content {
    const p = settings?.badge1Path;
    const usePath = (p && existsSync(p)) ? p : FALLBACK_BADGE1;
    const isSvg   = usePath.toLowerCase().endsWith('.svg');
    const base: any = { alignment: 'right', width: 40, margin: [0, 0, 15, 0], color: '#e9582a' };
    return isSvg
      ? { ...base, svg: readFileSync(usePath).toString() }
      : { ...base, image: usePath };
  }

  private buildFooterBadge2(settings: CompanySettingsEntity | null): Content {
    const p = settings?.badge2Path;
    const usePath = (p && existsSync(p)) ? p : FALLBACK_BADGE2;
    return { image: usePath, width: 40, margin: [25, 0, 0, 0], color: '#e9582a' };
  }

  private buildFooterText(settings: CompanySettingsEntity | null): string {
    const paymentText = settings?.paymentFooterText
      ?? `Zahlung innerhalb von ${settings?.paymentTermDays ?? 14} Tagen netto Kassa`;

    const bankLines = (settings?.bankAccounts ?? [])
      .map(b => `${b.name} · IBAN: ${b.iban} · BIC: ${b.bic}`)
      .join(' · ');

    const city = settings?.issueCity ?? 'Landeck';
    const base = `Zahlbar und klagbar in ${city}`;

    return [paymentText, base, bankLines].filter(Boolean).join(' · ');
  }

  private buildHeaderStack(settings: CompanySettingsEntity | null): Content[] {
    const s = settings;
    const lines: Content[] = [];

    if (s?.street)            lines.push({ text: s.street,                        style: 'header' });
    if (s?.zip || s?.city)    lines.push({ text: `${s.zip ?? ''} ${s.city ?? ''}`.trim(), style: 'header' });
    if (s?.phone)             lines.push({ text: ` `, style: 'subheader' },
                                          { text: `Mobile ${s.phone}`,            style: 'subheader' });
    if (s?.email)             lines.push({ text: `E-Mail: ${s.email}`,            style: 'subheader' });
    if (s?.website)           lines.push({ text: s.website,                       style: 'subheader' });
    if (s?.firmenbuchnummer)  lines.push({ text: s.firmenbuchnummer,              style: 'subheader' });

    // Fallback wenn noch keine Einstellungen gesetzt
    if (lines.length === 0) {
      lines.push(
        { text: 'Fliesserau 384 b',            style: 'header' },
        { text: '6500 Landeck',                style: 'header' },
        { text: ' ',                            style: 'subheader' },
        { text: 'Mobile +43 699 10 63 63 45',  style: 'subheader' },
        { text: 'E-Mail: office@holz-abler.com', style: 'subheader' },
        { text: 'www.holz-abler.com',           style: 'subheader' },
        { text: 'FN.: 303902s, ATU63848368',   style: 'subheader' },
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

      header: () => [{
        columns: [
          self.buildLogoContent(settings),
          {
            alignment: 'right',
            margin:    [0, 25, 70, 0],
            stack:     self.buildHeaderStack(settings),
          },
        ],
      }, {
        canvas: [{ type: 'line', x1: 50, y1: 5, x2: 595 - 50, y2: 5, lineWidth: 1 }],
      }],

      footer: () => [{
        canvas: [{ type: 'line', x1: 50, y1: 0, x2: 595 - 50, y2: 0, lineWidth: 1 }],
        margin: [0, 30, 0, 5],
      }, {
        table: {
          widths: [120, '*', 120],
          body: [[
            self.buildFooterBadge1(settings),
            { text: self.buildFooterText(settings), style: 'footerText' },
            self.buildFooterBadge2(settings),
          ]],
        },
        layout: 'noBorders',
      }],

      content: [],
      styles:  this.buildStyles(),
      defaultStyle: { font: 'Arial', fontSize: 12 },
    };
  }

  private buildStyles() {
    return {
      header:      { fontSize: 12, color: 'black' },
      subheader:   { fontSize: 9,  color: 'black' },
      footerText:  { fontSize: 8,  margin: [0, 10, 0, 0], alignment: 'center', color: 'black' },
      tableExample:   { margin: [0, 5, 0, 15] },
      tableHeader:    { bold: true, fontSize: 7, color: '#e9582a' },
      tableSum:       { color: 'black', bold: true },
      tableSumHeader: { bold: true, fontSize: 10, color: 'black' },
      tableCell:      { fontSize: 7 },
      slipCell:       { color: '#e9582a' },
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

  private buildSlipAnnotations(slip: SlipsheetEntity): Content | null {
    const items: Content[] = [];
    slip?.annotations?.forEach((element: AnnotationEntity) => {
      items.push({ text: element.text, style: 'slipAnnotation' });
    });
    return items.length === 0 ? null : items;
  }

  private buildOrders(bill: BillEntity, settings: CompanySettingsEntity | null): Content {
    const vatRate = settings?.vatRate ?? 20;

    const isDiscount        = bill.slipsheets.some(c => c.orderEntries.some(o => o.articleGroupRabatt && o.articleGroupRabatt !== 0));
    const isDiscountSpecial = bill.slipsheets.some(c => c.orderEntries.some(o => o.customerRabatt    && o.customerRabatt    !== 0));

    const table: any = {
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: [60, 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [[
          { text: 'Pos',                                     style: 'tableHeader', margin: [0, 0, 5, 0] },
          { text: 'Art.Num.',                                style: 'tableHeader' },
          { text: 'Artikel',                                 style: 'tableHeader' },
          { text: 'Menge',                                   style: 'tableHeader' },
          { text: 'Preis',                                   style: 'tableHeader' },
          { text: isDiscount        ? 'Rabatt'       : '',   style: 'tableHeader' },
          { text: isDiscountSpecial ? 'Sonder\nRabatt' : '', style: 'tableHeader' },
          { text: 'Gesamt',                                  style: 'tableHeader' },
        ]],
      },
      layout: this.getTableDefaultLayout(),
    };

    let sum = 0;

    for (const slip of bill.slipsheets) {
      table.table.body.push([
        '',
        { text: 'Lieferschein von ' + moment(slip.createdAt).format('DD.MM.YYYY') + ' L' + slip.slipsheetnumber, colSpan: 6, style: 'slipCell' },
        '', '', '', '', '', '',
      ]);

      const annotation = this.buildSlipAnnotations(slip);
      if (annotation) {
        const annotationCell = { ...annotation, colSpan: 6 };
        table.table.body.push(['', annotationCell, '', '', '', '', '', '']);
      }

      for (let i = 0; i < slip.orderEntries.length; i++) {
        const el: OrderEntryEntity = slip.orderEntries[i];
        const amount          = el.amountCounted || el.amount;
        const discount        = el.articleGroupRabatt ?? 0;
        const discountSpecial = el.customerRabatt     ?? 0;
        const total           = amount * el.price * (100 - discount) / 100 * (100 - discountSpecial) / 100;
        sum += total;

        table.table.body.push([
          { text: i + 1,                                              style: 'tableCell' },
          { text: el.article?.artNumber ?? '',                        style: 'tableCell' },
          { text: el.text,                                            style: 'tableCell' },
          { text: amount,                                             style: 'tableCell', alignment: 'right' },
          { text: '€' + el.price.toFixed(2),                         style: 'tableCell', alignment: 'right' },
          { text: isDiscount        ? discount.toFixed(0)        + '%' : '', style: 'tableCell', alignment: 'right' },
          { text: isDiscountSpecial ? discountSpecial.toFixed(0) + '%' : '', style: 'tableCell', alignment: 'right' },
          { text: '€' + total.toFixed(2),                            style: 'tableCell', alignment: 'right' },
        ]);
      }
    }

    const vatLabel = `${vatRate}% MwSt.`;
    const empty = { text: '', border: [0, 0, 0, 0] };

    table.table.body.push(
      [empty, empty, empty, empty, { text: 'Summe',    colSpan: 2, style: 'tableCell', alignment: 'right' }, '', '', { text: '€' + sum.toFixed(2),                style: 'tableCell', alignment: 'right' }],
      [empty, empty, empty, empty, { text: vatLabel,   colSpan: 2, style: 'tableCell', alignment: 'right' }, '', '', { text: '€' + (sum * vatRate / 100).toFixed(2), style: 'tableCell', alignment: 'right' }],
      [empty, empty, empty, empty, { text: 'Gesamt',   colSpan: 2, style: 'tableSumHeader', alignment: 'right' }, '', '', { text: '€' + (sum * (1 + vatRate / 100)).toFixed(2), style: 'tableSumHeader', alignment: 'right' }],
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
          { text: 'Pos',     style: 'tableHeader', margin: [0, 0, 5, 0] },
          { text: 'Artikel', style: 'tableHeader' },
          { text: 'Typ',     style: 'tableHeader' },
          { text: 'Menge',   style: 'tableHeader' },
        ]],
      },
      layout: this.getSlipTableLayout(),
    };

    for (let i = 0; i < slip.orderEntries.length; i++) {
      const el = slip.orderEntries[i];
      table.table.body.push([
        { text: i + 1,                   style: 'tableCell' },
        { text: el.text,                 style: 'tableCell' },
        { text: el.article?.artNumber ?? '', style: 'tableCell' },
        { text: el.amount,               style: 'tableCell' },
      ]);
    }
    table.table.body.push(['', '', '', '']);
    return table;
  }

  private getTableDefaultLayout() {
    return {
      hLineWidth: (i: number, node: any) => {
        if (i === 0) return 0;
        if (i === node.table.body.length)     return 2;
        if (i === node.table.body.length - 1) return 1;
        return 1;
      },
      vLineWidth: () => 0,
      hLineColor: (i: number, node: any) => {
        if (i === node.table.body.length - 3) return 'black';
        return (i === 1 || i === node.table.body.length - 1 || i === node.table.body.length) ? 'black' : '#aaa';
      },
      paddingLeft:   (i: number) => (i <= 1 ? 0 : 5),
      paddingRight:  (i: number, node: any) => (i === node.table.widths.length - 1 ? 0 : 5),
      paddingTop:    () => 4,
      paddingBottom: () => 4,
      fillColor:     () => null,
    };
  }

  private getSlipTableLayout() {
    return {
      hLineWidth: (i: number, node: any) => {
        if (i === 0) return 0;
        if (i === node.table.body.length)     return 2;
        if (i === node.table.body.length - 1) return 1;
        return 1;
      },
      vLineWidth: () => 0,
      hLineColor: (i: number, node: any) =>
        (i === 1 || i === node.table.body.length - 1 || i === node.table.body.length) ? 'black' : '#aaa',
      paddingLeft:   (i: number) => (i <= 1 ? 0 : 5),
      paddingRight:  (i: number, node: any) => (i === node.table.widths.length - 1 ? 0 : 5),
      paddingTop:    () => 4,
      paddingBottom: () => 4,
      fillColor:     () => null,
    };
  }
}

---

WICHTIG nach dem Ersetzen:
Die Methoden generateDeliverySlip und generateBill sind jetzt async (geben Promise zurück).
Prüfe alle Aufrufer dieser Methoden:
  - apps/server/src/models/bills/bill.service.ts    → Methode generateBill
  - apps/server/src/models/bills/slipsheet.service.ts → Methode generateSlipsheet

In bill.service.ts:
  Suche nach:    const retpdf = this.pdfMakerService.generateBill(firstBillEntity);
  Ändere zu:     const retpdf = await this.pdfMakerService.generateBill(firstBillEntity);

  Suche nach:    const retpdf = this.pdfMakerService.generateBill(bill);   (in regenerateBillPdf)
  Ändere zu:     const retpdf = await this.pdfMakerService.generateBill(bill);

In slipsheet.service.ts:
  Suche nach:    const retpdf = this.pdfMakerService.generateDeliverySlip(slip);
  Ändere zu:     const retpdf = await this.pdfMakerService.generateDeliverySlip(slip);

  Stelle sicher, dass die umgebenden Methoden (generateSlipsheet etc.) ebenfalls async sind.
```

---

## Phase 3 — Frontend: SettingsService

**Prompt für den Agent:**

```
Arbeite im Repository sim-system, Branch first-init.
Erstelle den Angular-Service für die Settings-API.
Phase 1 und 2 (Backend) sind abgeschlossen.

Orientiere dich am Stil von apps/sim-system/src/app/services/customer.service.ts.

---

SCHRITT 1 — Model
Erstelle die Datei:
  apps/sim-system/src/app/models/settings.model.ts

Inhalt:
export interface BankAccount {
  name: string;
  iban: string;
  bic: string;
}

export class CompanySettings {
  id?: number;
  companyName: string = '';
  street: string = '';
  zip: string = '';
  city: string = '';
  country: string = 'Österreich';
  phone: string = '';
  email: string = '';
  website: string = '';
  firmenbuchnummer: string = '';
  vatId: string = '';
  issueCity: string = '';
  vatRate: number = 20;
  paymentTermDays: number = 14;
  paymentFooterText: string = '';
  bankAccounts: BankAccount[] = [];
  logoPath: string | null = null;
  badge1Path: string | null = null;
  badge2Path: string | null = null;
  updatedAt?: Date;

  constructor(init?: Partial<CompanySettings>) {
    Object.assign(this, init);
  }
}

---

SCHRITT 2 — Service
Erstelle die Datei:
  apps/sim-system/src/app/services/settings.service.ts

Inhalt:
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanySettings } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private http: HttpClient) {}

  get(): Observable<CompanySettings> {
    return this.http.get<any>('settings').pipe(
      map(o => o.success ? new CompanySettings(o.data ?? {}) : new CompanySettings()),
    );
  }

  save(settings: Partial<CompanySettings>): Observable<CompanySettings> {
    return this.http.put<any>('settings', settings).pipe(
      map(o => {
        if (o.success) return new CompanySettings(o.data);
        throw new Error(o.message || 'Fehler beim Speichern');
      }),
    );
  }

  uploadLogo(file: File): Observable<CompanySettings> {
    return this._upload('settings/logo', file);
  }

  uploadBadge1(file: File): Observable<CompanySettings> {
    return this._upload('settings/badge1', file);
  }

  uploadBadge2(file: File): Observable<CompanySettings> {
    return this._upload('settings/badge2', file);
  }

  private _upload(endpoint: string, file: File): Observable<CompanySettings> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<any>(endpoint, fd).pipe(
      map(o => {
        if (o.success) return new CompanySettings(o.data);
        throw new Error(o.message || 'Upload fehlgeschlagen');
      }),
    );
  }
}
```

---

## Phase 4 — Frontend: Settings-Komponente

**Prompt für den Agent:**

```
Arbeite im Repository sim-system, Branch first-init.
Erstelle die Angular Settings-Seite unter /settings.
Phase 1–3 sind abgeschlossen.

Orientiere dich beim Stil exakt an apps/sim-system/src/app/views/customer-edit/.
Verwende standalone components, signals, ReactiveFormsModule, ChangeDetectionStrategy.OnPush.
CSS-Klassen: sims-card, sims-label, sims-input, btn-sims-primary, btn-sims-ghost,
             sims-page-header, eyebrow, page-title — genau wie in anderen Views.

---

SCHRITT 1 — Komponente TypeScript
Erstelle die Datei:
  apps/sim-system/src/app/views/settings/settings.component.ts

Inhalt:
import {
  ChangeDetectionStrategy, Component, inject, signal, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { CompanySettings } from '../../models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);

  readonly activeTab   = signal<'firma' | 'zahlung' | 'logos'>('firma');
  readonly saving      = signal(false);
  readonly loading     = signal(true);
  readonly error       = signal('');
  readonly saveSuccess = signal(false);

  readonly logoPreviewUrl    = signal<string | null>(null);
  readonly badge1PreviewUrl  = signal<string | null>(null);
  readonly badge2PreviewUrl  = signal<string | null>(null);

  readonly form = new FormGroup({
    // Tab 1 — Firma
    companyName:      new FormControl(''),
    street:           new FormControl(''),
    zip:              new FormControl(''),
    city:             new FormControl(''),
    country:          new FormControl('Österreich'),
    phone:            new FormControl(''),
    email:            new FormControl(''),
    website:          new FormControl(''),
    firmenbuchnummer: new FormControl(''),
    vatId:            new FormControl(''),
    issueCity:        new FormControl(''),
    // Tab 2 — Zahlung
    vatRate:           new FormControl<number>(20),
    paymentTermDays:   new FormControl<number>(14),
    paymentFooterText: new FormControl(''),
    bankAccounts:      new FormArray<FormGroup>([]),
  });

  get bankAccountsArray(): FormArray<FormGroup> {
    return this.form.get('bankAccounts') as FormArray<FormGroup>;
  }

  ngOnInit() {
    this.settingsService.get().subscribe({
      next: (s) => {
        this.patchForm(s);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private patchForm(s: CompanySettings) {
    this.form.patchValue({
      companyName:      s.companyName,
      street:           s.street,
      zip:              s.zip,
      city:             s.city,
      country:          s.country,
      phone:            s.phone,
      email:            s.email,
      website:          s.website,
      firmenbuchnummer: s.firmenbuchnummer,
      vatId:            s.vatId,
      issueCity:        s.issueCity,
      vatRate:          s.vatRate,
      paymentTermDays:  s.paymentTermDays,
      paymentFooterText: s.paymentFooterText,
    });
    this.bankAccountsArray.clear();
    (s.bankAccounts ?? []).forEach(b => this.bankAccountsArray.push(this.newBankGroup(b)));
    if (s.logoPath)   this.logoPreviewUrl.set('/uploads/' + s.logoPath.split('uploads/').pop());
    if (s.badge1Path) this.badge1PreviewUrl.set('/uploads/' + s.badge1Path.split('uploads/').pop());
    if (s.badge2Path) this.badge2PreviewUrl.set('/uploads/' + s.badge2Path.split('uploads/').pop());
  }

  private newBankGroup(init?: { name: string; iban: string; bic: string }): FormGroup {
    return new FormGroup({
      name: new FormControl(init?.name ?? ''),
      iban: new FormControl(init?.iban ?? ''),
      bic:  new FormControl(init?.bic  ?? ''),
    });
  }

  addBank() { this.bankAccountsArray.push(this.newBankGroup()); }
  removeBank(i: number) { this.bankAccountsArray.removeAt(i); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set('');
    this.settingsService.save(this.form.getRawValue() as any).subscribe({
      next: (s) => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.message || 'Fehler beim Speichern');
      },
    });
  }

  onFileChange(event: Event, field: 'logo' | 'badge1' | 'badge2') {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    const upload$ =
      field === 'logo'   ? this.settingsService.uploadLogo(file)   :
      field === 'badge1' ? this.settingsService.uploadBadge1(file) :
                           this.settingsService.uploadBadge2(file);

    upload$.subscribe({
      next: (s) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          if (field === 'logo')   this.logoPreviewUrl.set(url);
          if (field === 'badge1') this.badge1PreviewUrl.set(url);
          if (field === 'badge2') this.badge2PreviewUrl.set(url);
        };
        reader.readAsDataURL(file);
      },
      error: (err) => this.error.set(err.message || 'Upload fehlgeschlagen'),
    });
  }

  setTab(tab: 'firma' | 'zahlung' | 'logos') { this.activeTab.set(tab); }
}

---

SCHRITT 2 — Template HTML
Erstelle die Datei:
  apps/sim-system/src/app/views/settings/settings.component.html

Inhalt:
<div class="sims-page-header">
  <div>
    <div class="eyebrow">System</div>
    <h1 class="page-title">Einstellungen</h1>
  </div>
</div>

@if (error()) {
  <div class="sims-card error-card mb-3">{{ error() }}</div>
}
@if (saveSuccess()) {
  <div class="sims-card success-card mb-3">✓ Einstellungen gespeichert</div>
}

<!-- TAB NAV -->
<div class="settings-tabs mb-3">
  <button class="settings-tab" [class.active]="activeTab() === 'firma'"   (click)="setTab('firma')">Firmendaten</button>
  <button class="settings-tab" [class.active]="activeTab() === 'zahlung'" (click)="setTab('zahlung')">Zahlungskonditionen</button>
  <button class="settings-tab" [class.active]="activeTab() === 'logos'"   (click)="setTab('logos')">Logos & Uploads</button>
</div>

@if (loading()) {
  <div class="sims-card skeleton" style="height:400px;"></div>
}

@if (!loading()) {
  <form [formGroup]="form" (ngSubmit)="save()">

    <!-- TAB 1: FIRMA -->
    @if (activeTab() === 'firma') {
      <div class="sims-card mb-3">
        <div class="form-eyebrow">Firmenstammdaten</div>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="sims-label">Firmenname</label>
            <input type="text" class="sims-input" formControlName="companyName" />
          </div>
          <div class="col-12 col-md-6">
            <label class="sims-label">Ausstellungsort (für Rechnungen)</label>
            <input type="text" class="sims-input" formControlName="issueCity" placeholder="z.B. Landeck" />
          </div>
          <div class="col-12">
            <label class="sims-label">Straße</label>
            <input type="text" class="sims-input" formControlName="street" />
          </div>
          <div class="col-6 col-md-3">
            <label class="sims-label">PLZ</label>
            <input type="text" class="sims-input sims-input-mono" formControlName="zip" />
          </div>
          <div class="col-6 col-md-3">
            <label class="sims-label">Ort</label>
            <input type="text" class="sims-input" formControlName="city" />
          </div>
          <div class="col-12 col-md-6">
            <label class="sims-label">Land</label>
            <input type="text" class="sims-input" formControlName="country" />
          </div>
          <div class="col-12 col-md-6">
            <label class="sims-label">Telefon / Mobil</label>
            <input type="tel" class="sims-input" formControlName="phone" />
          </div>
          <div class="col-12 col-md-6">
            <label class="sims-label">E-Mail</label>
            <input type="email" class="sims-input" formControlName="email" />
          </div>
          <div class="col-12 col-md-6">
            <label class="sims-label">Website</label>
            <input type="url" class="sims-input" formControlName="website" placeholder="www.meinefirma.at" />
          </div>
          <div class="col-12 col-md-6">
            <label class="sims-label">FN + UID</label>
            <input type="text" class="sims-input sims-input-mono" formControlName="firmenbuchnummer" placeholder="FN.: 000000x, ATU00000000" />
          </div>
          <div class="col-12 col-md-6">
            <label class="sims-label">UID-Nummer (separat)</label>
            <input type="text" class="sims-input sims-input-mono" formControlName="vatId" placeholder="ATU00000000" />
          </div>
        </div>
      </div>
    }

    <!-- TAB 2: ZAHLUNG -->
    @if (activeTab() === 'zahlung') {
      <div class="sims-card mb-3">
        <div class="form-eyebrow">Zahlungskonditionen</div>
        <div class="row g-3">
          <div class="col-6 col-md-3">
            <label class="sims-label">Zahlungsfrist (Tage)</label>
            <input type="number" class="sims-input sims-input-mono" formControlName="paymentTermDays" min="0" />
          </div>
          <div class="col-6 col-md-3">
            <label class="sims-label">MwSt.-Satz (%)</label>
            <input type="number" class="sims-input sims-input-mono" formControlName="vatRate" min="0" max="100" />
          </div>
          <div class="col-12">
            <label class="sims-label">Zahlungstext (PDF-Footer)</label>
            <textarea class="sims-input" formControlName="paymentFooterText" rows="3"
              placeholder="Zahlung innerhalb von 14 Tagen netto Kassa · Zahlbar und klagbar in …"></textarea>
          </div>
        </div>
      </div>

      <div class="sims-card mb-3">
        <div class="form-eyebrow">Bankverbindungen</div>

        <div formArrayName="bankAccounts">
          @for (bank of bankAccountsArray.controls; track $index) {
            <div [formGroupName]="$index" class="bank-entry mb-2">
              <div class="bank-entry-header">
                <span class="bank-label">Bank {{ $index + 1 }}</span>
                <button type="button" class="btn-sims-ghost btn-sm" (click)="removeBank($index)">Entfernen</button>
              </div>
              <div class="row g-3">
                <div class="col-12 col-md-4">
                  <label class="sims-label">Bankname</label>
                  <input type="text" class="sims-input" formControlName="name" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="sims-label">IBAN</label>
                  <input type="text" class="sims-input sims-input-mono" formControlName="iban" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="sims-label">BIC</label>
                  <input type="text" class="sims-input sims-input-mono" formControlName="bic" />
                </div>
              </div>
            </div>
          }
        </div>

        <button type="button" class="btn-sims-ghost mt-2" (click)="addBank()">+ Bankverbindung hinzufügen</button>
      </div>
    }

    <!-- TAB 3: LOGOS -->
    @if (activeTab() === 'logos') {
      <div class="sims-card mb-3">
        <div class="form-eyebrow">Uploads</div>
        <div class="uploads-grid">

          <div class="upload-item">
            <label class="sims-label">Firmenlogo (SVG oder PNG)</label>
            <div class="upload-zone" (click)="logoInput.click()">
              @if (logoPreviewUrl()) {
                <img [src]="logoPreviewUrl()" alt="Logo" class="upload-preview" />
              } @else {
                <div class="upload-placeholder">
                  <span class="upload-icon">🏷️</span>
                  <span>Logo hochladen</span>
                  <small>SVG bevorzugt · max. 1 MB</small>
                </div>
              }
            </div>
            <input #logoInput type="file" accept=".svg,.png,.jpg" style="display:none"
              (change)="onFileChange($event, 'logo')" />
          </div>

          <div class="upload-item">
            <label class="sims-label">Badge links (optional)</label>
            <div class="upload-zone" (click)="badge1Input.click()">
              @if (badge1PreviewUrl()) {
                <img [src]="badge1PreviewUrl()" alt="Badge 1" class="upload-preview" />
              } @else {
                <div class="upload-placeholder">
                  <span class="upload-icon">🦅</span>
                  <span>Badge hochladen</span>
                  <small>SVG oder PNG</small>
                </div>
              }
            </div>
            <input #badge1Input type="file" accept=".svg,.png" style="display:none"
              (change)="onFileChange($event, 'badge1')" />
          </div>

          <div class="upload-item">
            <label class="sims-label">Badge rechts (optional)</label>
            <div class="upload-zone" (click)="badge2Input.click()">
              @if (badge2PreviewUrl()) {
                <img [src]="badge2PreviewUrl()" alt="Badge 2" class="upload-preview" />
              } @else {
                <div class="upload-placeholder">
                  <span class="upload-icon">🏅</span>
                  <span>Badge hochladen</span>
                  <small>PNG · max. 500 KB</small>
                </div>
              }
            </div>
            <input #badge2Input type="file" accept=".svg,.png,.jpg" style="display:none"
              (change)="onFileChange($event, 'badge2')" />
          </div>

        </div>
        <p class="upload-hint-text">Uploads werden sofort gespeichert. Das Logo wird beim nächsten PDF-Erstellen verwendet.</p>
      </div>
    }

    <!-- STICKY SAVE -->
    <div class="sticky-actions">
      <button type="submit" class="btn-sims-primary" [disabled]="saving()">
        {{ saving() ? 'Wird gespeichert…' : 'Einstellungen speichern' }}
      </button>
    </div>

  </form>
}

---

SCHRITT 3 — SCSS
Erstelle die Datei:
  apps/sim-system/src/app/views/settings/settings.component.scss

Inhalt:
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mt-2 { margin-top: 0.75rem; }

.error-card {
  color: var(--status-empty);
  border-left: 3px solid var(--status-empty);
}
.success-card {
  color: var(--status-ok);
  border-left: 3px solid var(--status-ok);
}

.form-eyebrow {
  font-family: var(--mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: 1.25rem;
}

/* TABS */
.settings-tabs {
  display: flex;
  gap: 2px;
  background: var(--border);
  padding: 2px;
  border-radius: var(--radius-md);
  width: fit-content;
}
.settings-tab {
  font-family: var(--sans);
  font-size: 0.85rem;
  padding: 0.45rem 1rem;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--ink-3);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.settings-tab.active {
  background: white;
  color: var(--ink);
  box-shadow: 0 1px 3px rgba(15,23,42,0.08);
}
.settings-tab:hover:not(.active) {
  color: var(--ink-2);
}

/* BANK */
.bank-entry {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem;
}
.bank-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.bank-label {
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--ink);
}
.btn-sm {
  font-size: 0.78rem;
  padding: 0.25rem 0.7rem;
}

/* UPLOADS */
.uploads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1rem;
}
.upload-item { display: flex; flex-direction: column; gap: 0.3rem; }
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  overflow: hidden;
}
.upload-zone:hover {
  border-color: var(--accent-highlight);
  background: var(--accent-light);
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: var(--ink-3);
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
}
.upload-icon { font-size: 1.75rem; }
.upload-preview {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
  padding: 0.5rem;
}
.upload-hint-text {
  font-size: 0.8rem;
  color: var(--ink-3);
  margin-bottom: 0;
}

/* STICKY */
.sticky-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  position: sticky;
  bottom: 1rem;
  padding: 0.75rem 0;
}

/* GRID HELPERS */
.row { display: flex; flex-wrap: wrap; margin: -0.375rem; }
.row.g-3 > * { padding: 0.375rem; }
[class^="col-"] { width: 100%; }
@media (min-width: 768px) {
  .col-md-3 { width: 25%; }
  .col-md-4 { width: 33.333%; }
  .col-md-6 { width: 50%; }
}
.col-6  { width: 50%; }
.col-12 { width: 100%; }
```

---

## Phase 5 — Frontend: Route + Navigation verdrahten

**Prompt für den Agent:**

```
Arbeite im Repository sim-system, Branch first-init.
Verdrahte die Settings-Komponente mit dem Router und der Sidebar-Navigation.
Phasen 1–4 sind abgeschlossen.

---

SCHRITT 1 — Route hinzufügen
Bearbeite die Datei:
  apps/sim-system/src/app/app.routes.ts

Füge vor der Wildcard-Route (path: '**') folgenden Eintrag hinzu:

  {
    path: 'settings',
    loadComponent: () =>
      import('./views/settings/settings.component').then(m => m.SettingsComponent)
  },

---

SCHRITT 2 — Navigation erweitern
Bearbeite die Datei:
  apps/sim-system/src/app/app.ts

In der navItems-Array gibt es eine Sektion 'Werkzeuge'. Füge dort einen Settings-Eintrag hinzu:

Suche den Block:
  { label: 'Werkzeuge', children: [
    { label: 'Inventur', route: '/inventory', icon: 'inventory' },
  ]},

Ändere ihn zu:
  { label: 'Werkzeuge', children: [
    { label: 'Inventur',      route: '/inventory', icon: 'inventory' },
    { label: 'Einstellungen', route: '/settings',  icon: 'settings'  },
  ]},

---

SCHRITT 3 — Settings-Icon definieren
In derselben Datei (apps/sim-system/src/app/app.ts) gibt es das ICONS-Objekt.
Füge folgenden Eintrag hinzu:

  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,

---

SCHRITT 4 — Prüfen
Stelle sicher, dass in apps/sim-system/src/app/app.ts die bottomNavItems-Array
NICHT um Settings erweitert wird — die mobile Bottom-Navigation soll nur die 5
wichtigsten Einträge zeigen (Dashboard, Artikel, Kunden, Belege, Inventur).
```

---

## Abschluss-Check (nach allen Phasen)

**Prompt für den Agent:**

```
Führe nach Abschluss aller Phasen folgende Prüfungen durch:

1. BACKEND KOMPILIERUNG
   Führe aus: cd apps/server && npx tsc --noEmit
   Erwartetes Ergebnis: Keine Fehler.
   Häufige Fehler:
   - "Object is possibly null" bei settings?.field → mit ?? '' oder ?? 0 absichern
   - "Property does not exist" → CompanySettingsEntity-Felder prüfen
   - Async-Fehler bei generateBill/generateDeliverySlip → await in allen Aufrufern prüfen

2. CIRCULAR DEPENDENCY CHECK
   Prüfe manuell: Importiert CompanySettingsModule irgendwo SharedModule?
   Das wäre eine Circular Dependency. Es darf nur in eine Richtung gehen:
   SharedModule → CompanySettingsModule → (keine Rückimporte)

3. FRONTEND KOMPILIERUNG
   Führe aus: cd apps/sim-system && npx ng build --configuration=development 2>&1 | head -50
   Erwartetes Ergebnis: Keine Fehler.

4. UPLOADS-VERZEICHNIS
   Stelle sicher dass apps/server/uploads/settings/.gitkeep existiert.

5. MULTER DEPENDENCY
   Prüfe in package.json (Root) ob vorhanden:
   - @nestjs/platform-express
   - multer
   - @types/multer (devDependencies)
   Falls nicht: Ausgabe mit Installationsbefehl.

6. FALLBACK-VERHALTEN
   Überprüfe in pdfmaker.service.ts:
   - FALLBACK_LOGO zeigt auf den existierenden Pfad apps/server/src/common/pdfAnnotation/logo.svg
   - Der join-Pfad nutzt __dirname korrekt (relativ zum dist-Verzeichnis nach Kompilierung)
   - Empfehlung: Pfad-Konstanten am Service-Anfang klar dokumentieren
```

---

## Hinweise für den Agent

- **Reihenfolge einhalten**: Phase 1 → 2 → 3 → 4 → 5. Phase 2 baut auf Phase 1 auf.
- **Bestehenden Code nicht löschen**: Die Dateien in `pdfAnnotation/` bleiben als Fallback erhalten.
- **SQLite synchronize**: Da `SQLITE_RUN_SYNCHRONIZE=true` in der `.env` gesetzt ist, erstellt TypeORM die neue Tabelle `company_settings` automatisch beim nächsten Start.
- **Keine Migrations nötig**: Nur für Produktionsumgebungen relevant, nicht für den aktuellen Stand.
- **Pfadtrenner**: Der bestehende Code nutzt `\\` (Windows-Pfade). Phase 2 verwendet `join()` aus `path` — das ist korrekt und cross-platform.