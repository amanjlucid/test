import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsDefinitionGroupComponent } from './hns-definition-group.component';

describe('HnsDefinitionGroupComponent', () => {
  let component: HnsDefinitionGroupComponent;
  let fixture: ComponentFixture<HnsDefinitionGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsDefinitionGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsDefinitionGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
