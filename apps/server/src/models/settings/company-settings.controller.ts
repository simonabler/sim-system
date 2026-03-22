import {
  Get,
  Put,
  Post,
  Body,
  Controller,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  ValidationPipe,
  UsePipes,
  UploadedFile,
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
