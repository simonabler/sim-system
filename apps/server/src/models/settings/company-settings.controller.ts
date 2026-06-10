import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  SerializeOptions,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ReS } from '../../common/res.model';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CompanySettingsService } from './company-settings.service';
import {
  CompanySettingsEntity,
  defaultSettingsGroupsForSerializing,
} from './serializers/company-settings.serializer';

const UPLOAD_DEST = join(process.cwd(), 'uploads', 'settings');

function storageConfig(fieldName: string) {
  return diskStorage({
    destination: UPLOAD_DEST,
    filename: (_req, file, cb) => {
      cb(null, `${fieldName}${extname(file.originalname)}`);
    },
  });
}

function pdfOnlyFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  const isPdf =
    file.mimetype === 'application/pdf' ||
    file.originalname.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    cb(new BadRequestException('Nur PDF-Dateien sind erlaubt'), false);
    return;
  }

  cb(null, true);
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

  @Get('/printers')
  @ApiOperation({ summary: 'Verfuegbare Drucker laden' })
  async getPrinters(): Promise<ReS<Array<{ deviceId: string; name: string }>>> {
    const printers = await this.settingsService.getPrinters();
    return ReS.FromData(
      printers.map((printer) => ({
        deviceId: printer.deviceId,
        name: printer.name,
      })),
    );
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
    return ReS.FromData(await this.settingsService.updateAssetPath('logoPath', relativePath));
  }

  @Post('/badge1')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Badge links hochladen' })
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig('badge1') }))
  async uploadBadge1(@UploadedFile() file: Express.Multer.File): Promise<ReS<CompanySettingsEntity>> {
    const relativePath = join('uploads', 'settings', file.filename);
    return ReS.FromData(await this.settingsService.updateAssetPath('badge1Path', relativePath));
  }

  @Post('/badge2')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Badge rechts hochladen' })
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig('badge2') }))
  async uploadBadge2(@UploadedFile() file: Express.Multer.File): Promise<ReS<CompanySettingsEntity>> {
    const relativePath = join('uploads', 'settings', file.filename);
    return ReS.FromData(await this.settingsService.updateAssetPath('badge2Path', relativePath));
  }

  @Post('/template-pdf')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Template-PDF hochladen' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageConfig('template'),
      fileFilter: pdfOnlyFilter as any,
    }),
  )
  async uploadTemplatePdf(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ReS<CompanySettingsEntity>> {
    const relativePath = join('uploads', 'settings', file.filename);
    return ReS.FromData(
      await this.settingsService.updateAssetPath('templatePdfPath', relativePath),
    );
  }
}
