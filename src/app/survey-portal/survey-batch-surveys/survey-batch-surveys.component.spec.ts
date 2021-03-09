import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyBatchSurveysComponent } from './survey-batch-surveys.component';

describe('SurveyBatchSurveysComponent', () => {
  let component: SurveyBatchSurveysComponent;
  let fixture: ComponentFixture<SurveyBatchSurveysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyBatchSurveysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyBatchSurveysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
