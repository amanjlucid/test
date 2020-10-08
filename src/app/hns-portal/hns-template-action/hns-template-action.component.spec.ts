import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsTemplateActionComponent } from './hns-template-action.component';

describe('HnsTemplateActionComponent', () => {
  let component: HnsTemplateActionComponent;
  let fixture: ComponentFixture<HnsTemplateActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsTemplateActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsTemplateActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
