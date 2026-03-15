import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { BillController } from './bill.controller';
import { BillService } from '../bill.service';
import { SlipsheetService } from '../slipsheet.service';
import { AppConfigService } from '../../../config/app/config.service';
import { BillState } from '../enums/bill-state.enum';

async function closeStream(file: StreamableFile): Promise<void> {
  const stream = file.getStream();
  await new Promise<void>((resolve) => {
    stream.on('open', () => {
      stream.destroy();
    });
    stream.on('close', () => resolve());
    stream.on('error', () => resolve());
  });
}

describe('BillController', () => {
  let controller: BillController;
  let billService: { getAllInformations: jest.Mock; regenerateBillPdf: jest.Mock };

  const testDir = join(tmpdir(), 'simsystem-bill-controller-spec');

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true });
  });

  beforeEach(async () => {
    billService = {
      getAllInformations: jest.fn(),
      regenerateBillPdf: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillController],
      providers: [
        {
          provide: BillService,
          useValue: billService,
        },
        {
          provide: SlipsheetService,
          useValue: {},
        },
        {
          provide: AppConfigService,
          useValue: { pdf_bill_path: testDir },
        },
      ],
    }).compile();

    controller = module.get<BillController>(BillController);
  });

  it('should regenerate pdf when bill state is open', async () => {
    const filename = 'open-bill.pdf';
    const filepath = join(testDir, filename);
    writeFileSync(filepath, 'dummy-open');

    billService.getAllInformations.mockResolvedValue({
      id: 1,
      path: filename,
      state: BillState.OPEN,
    });
    billService.regenerateBillPdf.mockResolvedValue({
      id: 1,
      path: filename,
      state: BillState.OPEN,
    });

    const response = { set: jest.fn() } as any;
    const file = await controller.getPDF(1, response);

    expect(billService.regenerateBillPdf).toHaveBeenCalledWith(1);
    expect(response.set).toHaveBeenCalled();
    expect(file).toBeInstanceOf(StreamableFile);
    await closeStream(file);
  });

  it('should not regenerate pdf when bill state is closed', async () => {
    const filename = 'closed-bill.pdf';
    const filepath = join(testDir, filename);
    writeFileSync(filepath, 'dummy-closed');

    billService.getAllInformations.mockResolvedValue({
      id: 2,
      path: filename,
      state: BillState.CLOSED,
    });

    const response = { set: jest.fn() } as any;
    const file = await controller.getPDF(2, response);

    expect(billService.regenerateBillPdf).not.toHaveBeenCalled();
    expect(response.set).toHaveBeenCalled();
    expect(file).toBeInstanceOf(StreamableFile);
    await closeStream(file);
  });
});
