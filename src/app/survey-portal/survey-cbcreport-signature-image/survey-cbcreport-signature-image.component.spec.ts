import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyCbcreportSignatureImageComponent } from './survey-cbcreport-signature-image.component';

describe('SurveyCbcreportSignatureImageComponent', () => {
  let component: SurveyCbcreportSignatureImageComponent;
  let fixture: ComponentFixture<SurveyCbcreportSignatureImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyCbcreportSignatureImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyCbcreportSignatureImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
