import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersurveyanswerComponent } from './customersurveyanswer.component';

describe('CustomersurveyanswerComponent', () => {
  let component: CustomersurveyanswerComponent;
  let fixture: ComponentFixture<CustomersurveyanswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomersurveyanswerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomersurveyanswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
