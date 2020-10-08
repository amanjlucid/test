import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsTemplateIssueComponent } from './hns-template-issue.component';

describe('HnsTemplateIssueComponent', () => {
  let component: HnsTemplateIssueComponent;
  let fixture: ComponentFixture<HnsTemplateIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsTemplateIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsTemplateIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
