import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyProjectAccessComponent } from './survey-project-access.component';

describe('SurveyProjectAccessComponent', () => {
  let component: SurveyProjectAccessComponent;
  let fixture: ComponentFixture<SurveyProjectAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyProjectAccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyProjectAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
