import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentBudgetCodeComponent } from './assessment-budget-code.component';

describe('AssessmentBudgetCodeComponent', () => {
  let component: AssessmentBudgetCodeComponent;
  let fixture: ComponentFixture<AssessmentBudgetCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentBudgetCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentBudgetCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
