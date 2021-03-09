import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyCbcreportSelectImageComponent } from './survey-cbcreport-select-image.component';

describe('SurveyCbcreportSelectImageComponent', () => {
  let component: SurveyCbcreportSelectImageComponent;
  let fixture: ComponentFixture<SurveyCbcreportSelectImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyCbcreportSelectImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyCbcreportSelectImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
