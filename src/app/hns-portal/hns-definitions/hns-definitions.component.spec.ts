import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsDefinitionsComponent } from './hns-definitions.component';

describe('HnsDefinitionsComponent', () => {
  let component: HnsDefinitionsComponent;
  let fixture: ComponentFixture<HnsDefinitionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsDefinitionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsDefinitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
