import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyProjectSurveysComponent } from './survey-project-surveys.component';

describe('SurveyProjectSurveysComponent', () => {
  let component: SurveyProjectSurveysComponent;
  let fixture: ComponentFixture<SurveyProjectSurveysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyProjectSurveysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyProjectSurveysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
