import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShoppingcartComponent } from './shoppingcart.component';
import { ShoppingcartService } from '../../services/shoppingcart.service';
import { ArticleService } from '../../services/article.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap';
import { Shoppingcart } from '../../models';

describe('ShoppingcartComponent', () => {
  let component: ShoppingcartComponent;
  let fixture: ComponentFixture<ShoppingcartComponent>;
  let shoppingcartServiceSpy: jasmine.SpyObj<ShoppingcartService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async(() => {
    shoppingcartServiceSpy = jasmine.createSpyObj('ShoppingcartService', ['addAnnotation', 'updateOrder', 'addOrder']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ShoppingcartComponent],
      providers: [
        { provide: ShoppingcartService, useValue: shoppingcartServiceSpy },
        { provide: ArticleService, useValue: jasmine.createSpyObj('ArticleService', ['getAll']) },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: BsModalService, useValue: jasmine.createSpyObj('BsModalService', ['show']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ShoppingcartComponent, {
      set: { template: '' },
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingcartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add annotation and emit updated shoppingcart', () => {
    const updatedCart = new Shoppingcart({ id: 1, annotations: [{ text: 'K1' }] });
    component.shoppingcart = new Shoppingcart({ id: 1, orderEntries: [] });
    component.annotationText = 'K1';
    shoppingcartServiceSpy.addAnnotation.and.returnValue(of(updatedCart));
    spyOn(component.shoppingcartChange, 'emit');

    component.addAnnotation();

    expect(shoppingcartServiceSpy.addAnnotation).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 1 }),
      'K1',
    );
    expect(component.shoppingcart.id).toBe(1);
    expect(component.annotationText).toBe('');
    expect(component.shoppingcartChange.emit).toHaveBeenCalledWith(updatedCart);
    expect(toastrSpy.success).toHaveBeenCalled();
  });

  it('should not call service when annotation is empty', () => {
    component.shoppingcart = new Shoppingcart({ id: 1, orderEntries: [] });
    component.annotationText = '   ';

    component.addAnnotation();

    expect(shoppingcartServiceSpy.addAnnotation).not.toHaveBeenCalled();
  });
});
