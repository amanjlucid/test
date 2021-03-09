import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyBatchesComponent } from './survey-batches.component';

describe('SurveyBatchesComponent', () => {
  let component: SurveyBatchesComponent;
  let fixture: ComponentFixture<SurveyBatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyBatchesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyBatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
