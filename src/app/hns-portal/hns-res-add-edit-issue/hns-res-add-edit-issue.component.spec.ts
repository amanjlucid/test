import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResAddEditIssueComponent } from './hns-res-add-edit-issue.component';

describe('HnsResAddEditIssueComponent', () => {
  let component: HnsResAddEditIssueComponent;
  let fixture: ComponentFixture<HnsResAddEditIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResAddEditIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResAddEditIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
