import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoProgramManagmentCreatePaymentScheduleComponent } from './wo-pm-create-payment-schedule.component';

describe('WoProgramManagmentCreatePaymentScheduleComponent', () => {
  let component: WoProgramManagmentCreatePaymentScheduleComponent;
  let fixture: ComponentFixture<WoProgramManagmentCreatePaymentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoProgramManagmentCreatePaymentScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoProgramManagmentCreatePaymentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
