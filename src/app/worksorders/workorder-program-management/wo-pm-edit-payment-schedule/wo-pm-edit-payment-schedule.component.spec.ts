import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoProgramManagmentEditPaymentScheduleComponent } from './wo-pm-edit-payment-schedule.component';

describe('WoProgramManagmentEditPaymentScheduleComponent', () => {
  let component: WoProgramManagmentEditPaymentScheduleComponent;
  let fixture: ComponentFixture<WoProgramManagmentEditPaymentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoProgramManagmentEditPaymentScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoProgramManagmentEditPaymentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
