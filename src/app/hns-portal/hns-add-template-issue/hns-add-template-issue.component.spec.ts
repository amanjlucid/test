import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsAddTemplateIssueComponent } from './hns-add-template-issue.component';

describe('HnsAddTemplateIssueComponent', () => {
  let component: HnsAddTemplateIssueComponent;
  let fixture: ComponentFixture<HnsAddTemplateIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsAddTemplateIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsAddTemplateIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
