import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResAssessmenttabComponent } from './hns-res-assessmenttab.component';

describe('HnsResAssessmenttabComponent', () => {
  let component: HnsResAssessmenttabComponent;
  let fixture: ComponentFixture<HnsResAssessmenttabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResAssessmenttabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResAssessmenttabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
