import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsDefinitionQuestionComponent } from './hns-definition-question.component';

describe('HnsDefinitionQuestionComponent', () => {
  let component: HnsDefinitionQuestionComponent;
  let fixture: ComponentFixture<HnsDefinitionQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsDefinitionQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsDefinitionQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
