import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResEditAnswerComponent } from './hns-res-edit-answer.component';

describe('HnsResEditAnswerComponent', () => {
  let component: HnsResEditAnswerComponent;
  let fixture: ComponentFixture<HnsResEditAnswerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResEditAnswerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResEditAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
