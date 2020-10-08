import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResAssessmentComponent } from './hns-res-assessment.component';

describe('HnsResAssessmentComponent', () => {
  let component: HnsResAssessmentComponent;
  let fixture: ComponentFixture<HnsResAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
