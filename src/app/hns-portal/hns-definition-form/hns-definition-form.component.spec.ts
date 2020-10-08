import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsDefinitionFormComponent } from './hns-definition-form.component';

describe('HnsDefinitionFormComponent', () => {
  let component: HnsDefinitionFormComponent;
  let fixture: ComponentFixture<HnsDefinitionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsDefinitionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsDefinitionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
