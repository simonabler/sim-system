import { BillService } from './bill.service';
import { BillState } from './enums/bill-state.enum';

describe('BillService', () => {
  it('should set bill state to closed when regenerating pdf', async () => {
    const billRepository: any = {
      get: jest
        .fn()
        .mockResolvedValueOnce({
          id: 42,
          billNumber: '42',
          path: 'R_42.pdf',
          state: BillState.OPEN,
          slipsheets: [],
        })
        .mockResolvedValueOnce({
          id: 42,
          billNumber: '42',
          path: 'R_42.pdf',
          state: BillState.CLOSED,
          slipsheets: [],
        }),
      updateEntity: jest.fn().mockResolvedValue({}),
      manager: {},
    };

    const slipsheetService: any = {};
    const pdfMakerService: any = {
      generateBill: jest.fn().mockReturnValue({}),
      savePDFToFileSystem: jest.fn().mockResolvedValue(undefined),
    };
    const appConfigService: any = {
      pdf_bill_path: 'C:\\tmp',
    };

    const service = new BillService(
      billRepository,
      slipsheetService,
      pdfMakerService,
      appConfigService,
    );

    const result = await service.regenerateBillPdf(42);

    expect(billRepository.updateEntity).toHaveBeenCalledWith(42, {
      path: 'R_42.pdf',
      state: BillState.CLOSED,
    });
    expect(pdfMakerService.generateBill).toHaveBeenCalled();
    expect(pdfMakerService.savePDFToFileSystem).toHaveBeenCalled();
    expect(result.state).toBe(BillState.CLOSED);
  });
});
