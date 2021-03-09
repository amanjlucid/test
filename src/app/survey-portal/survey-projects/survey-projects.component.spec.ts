import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyProjectsComponent } from './survey-projects.component';

describe('SurveyProjectsComponent', () => {
  let component: SurveyProjectsComponent;
  let fixture: ComponentFixture<SurveyProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyProjectsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
