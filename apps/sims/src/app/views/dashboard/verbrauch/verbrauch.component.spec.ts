import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbrauchComponent } from './verbrauch.component';

describe('VerbrauchComponent', () => {
  let component: VerbrauchComponent;
  let fixture: ComponentFixture<VerbrauchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerbrauchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbrauchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
