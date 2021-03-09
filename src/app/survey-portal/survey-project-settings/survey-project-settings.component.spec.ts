import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyProjectSettingsComponent } from './survey-project-settings.component';

describe('SurveyProjectSettingsComponent', () => {
  let component: SurveyProjectSettingsComponent;
  let fixture: ComponentFixture<SurveyProjectSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyProjectSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyProjectSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
