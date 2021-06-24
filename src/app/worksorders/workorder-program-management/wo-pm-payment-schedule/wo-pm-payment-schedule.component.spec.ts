import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoProgramManagmentPaymentScheduleComponent } from './wo-pm-payment-schedule.component';

describe('WoProgramManagmentPaymentScheduleComponent', () => {
  let component: WoProgramManagmentPaymentScheduleComponent;
  let fixture: ComponentFixture<WoProgramManagmentPaymentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoProgramManagmentPaymentScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoProgramManagmentPaymentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
