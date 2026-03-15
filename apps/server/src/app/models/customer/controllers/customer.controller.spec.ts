import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from '../customer.service';
import { DiscountService } from '../../bills/discount.service';
import { OrderEntryService } from '../../bills/order-entry.service';
import { PdfMakerService } from '../../../common/services/pdfmaker.service';
import { SlipsheetService } from '../../bills/slipsheet.service';
import { BillService } from '../../bills/bill.service';

describe('CustomerController', () => {
  let controller: CustomerController;
  const customerServiceMock = {
    get: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const discountServiceMock = {
    createOrUpdate: jest.fn(),
  };
  const orderEntryServiceMock = {
    addOrderToSlipsheet: jest.fn(),
  };
  const pdfMakerServiceMock = {};
  const slipsheetServiceMock = {
    findFromCustomer: jest.fn(),
  };
  const billServiceMock = {
    findFromCustomer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        { provide: CustomerService, useValue: customerServiceMock },
        { provide: DiscountService, useValue: discountServiceMock },
        { provide: OrderEntryService, useValue: orderEntryServiceMock },
        { provide: PdfMakerService, useValue: pdfMakerServiceMock },
        { provide: SlipsheetService, useValue: slipsheetServiceMock },
        { provide: BillService, useValue: billServiceMock },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call customerService.get with discount relations', async () => {
    const customer = { id: 4 };
    customerServiceMock.get.mockResolvedValue(customer);

    const result = await controller.get(4);

    expect(customerServiceMock.get).toHaveBeenCalledWith(4, [
      'discounts',
      'discounts.articleGroup',
    ]);
    expect(result.data).toEqual(customer);
  });

  it('should call billService.findFromCustomer in getBills', async () => {
    const bills = [{ id: 10 }];
    billServiceMock.findFromCustomer.mockResolvedValue(bills);

    const result = await controller.getBills(9);

    expect(billServiceMock.findFromCustomer).toHaveBeenCalledWith(9);
    expect(result.data).toEqual(bills);
  });

  it('should call orderEntryService.addOrderToSlipsheet in postOrder', async () => {
    const customer = { id: 3 };
    const payload = { article: { id: 77 }, amount: 2 };
    const orderEntry = { id: 99 };
    customerServiceMock.get.mockResolvedValue(customer);
    orderEntryServiceMock.addOrderToSlipsheet.mockResolvedValue(orderEntry);

    const result = await controller.postOrder(3, payload as any);

    expect(customerServiceMock.get).toHaveBeenCalledWith(3);
    expect(orderEntryServiceMock.addOrderToSlipsheet).toHaveBeenCalledWith({
      customer,
      addOrderEntry: payload,
    });
    expect(result.data).toEqual(orderEntry);
  });
});
