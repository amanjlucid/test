import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsSurveyTypeListComponent } from './hns-survey-type-list.component';

describe('HnsSurveyTypeListComponent', () => {
  let component: HnsSurveyTypeListComponent;
  let fixture: ComponentFixture<HnsSurveyTypeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsSurveyTypeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsSurveyTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
