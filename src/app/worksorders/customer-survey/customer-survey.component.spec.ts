import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSurveyComponent } from './customer-survey.component';

describe('CustomerSurveyComponent', () => {
  let component: CustomerSurveyComponent;
  let fixture: ComponentFixture<CustomerSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerSurveyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
