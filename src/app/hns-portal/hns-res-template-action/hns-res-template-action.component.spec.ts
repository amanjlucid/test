import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResTemplateActionComponent } from './hns-res-template-action.component';

describe('HnsResTemplateActionComponent', () => {
  let component: HnsResTemplateActionComponent;
  let fixture: ComponentFixture<HnsResTemplateActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResTemplateActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResTemplateActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
