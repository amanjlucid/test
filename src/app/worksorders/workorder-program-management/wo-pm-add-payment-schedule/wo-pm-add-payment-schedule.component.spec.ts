import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoProgramManagmentAddPaymentScheduleComponent } from './wo-pm-add-payment-schedule.component';

describe('WoProgramManagmentAddPaymentScheduleComponent', () => {
  let component: WoProgramManagmentAddPaymentScheduleComponent;
  let fixture: ComponentFixture<WoProgramManagmentAddPaymentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoProgramManagmentAddPaymentScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoProgramManagmentAddPaymentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
