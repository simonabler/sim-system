import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ShoppingcartService } from './shoppingcart.service';
import { Shoppingcart } from '../models';

describe('ShoppingcartService', () => {
  let service: ShoppingcartService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ShoppingcartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add annotation and return refreshed shoppingcart', () => {
    const initialCart = new Shoppingcart({ id: 7 });
    let responseCart: Shoppingcart;

    service.addAnnotation(initialCart, 'Kommission A').subscribe((cart) => {
      responseCart = cart;
    });

    const postReq = httpMock.expectOne('slipsheets/7/annotation');
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ text: 'Kommission A' });
    postReq.flush({
      success: true,
      data: { id: 1, text: 'Kommission A' },
    });

    const getReq = httpMock.expectOne('slipsheets/7');
    expect(getReq.request.method).toBe('GET');
    getReq.flush({
      success: true,
      data: {
        id: 7,
        orderEntries: [],
        customer: {},
        bill: {},
        annotations: [{ id: 1, text: 'Kommission A' }],
      },
    });

    expect(responseCart).toBeTruthy();
    expect(responseCart.id).toBe(7);
    expect(responseCart.annotations.length).toBe(1);
    expect(responseCart.annotations[0].text).toBe('Kommission A');
  });
});
