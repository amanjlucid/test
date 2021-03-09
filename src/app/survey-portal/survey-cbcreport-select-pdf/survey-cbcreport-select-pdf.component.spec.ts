import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyCbcreportSelectPDFComponent } from './survey-cbcreport-select-pdf.component';

describe('SurveyCbcreportSelectPDFComponent', () => {
  let component: SurveyCbcreportSelectPDFComponent;
  let fixture: ComponentFixture<SurveyCbcreportSelectPDFComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyCbcreportSelectPDFComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyCbcreportSelectPDFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
