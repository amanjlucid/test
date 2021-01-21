import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddScheduleReportComponent } from './add-schedule-report.component';

describe('AddScheduleReportComponent', () => {
  let component: AddScheduleReportComponent;
  let fixture: ComponentFixture<AddScheduleReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddScheduleReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddScheduleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
