import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyCbcreportComponent } from './survey-cbcreport.component';

describe('SurveyCbcreportComponent', () => {
  let component: SurveyCbcreportComponent;
  let fixture: ComponentFixture<SurveyCbcreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyCbcreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyCbcreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
