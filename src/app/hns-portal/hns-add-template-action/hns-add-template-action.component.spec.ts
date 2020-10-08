import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsAddTemplateActionComponent } from './hns-add-template-action.component';

describe('HnsAddTemplateActionComponent', () => {
  let component: HnsAddTemplateActionComponent;
  let fixture: ComponentFixture<HnsAddTemplateActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsAddTemplateActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsAddTemplateActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
