import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsAddSeverityComponent } from './hns-add-severity.component';

describe('HnsAddSeverityComponent', () => {
  let component: HnsAddSeverityComponent;
  let fixture: ComponentFixture<HnsAddSeverityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsAddSeverityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsAddSeverityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
