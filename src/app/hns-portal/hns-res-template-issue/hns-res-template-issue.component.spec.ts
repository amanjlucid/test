import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResTemplateIssueComponent } from './hns-res-template-issue.component';

describe('HnsResTemplateIssueComponent', () => {
  let component: HnsResTemplateIssueComponent;
  let fixture: ComponentFixture<HnsResTemplateIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResTemplateIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResTemplateIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
