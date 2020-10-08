import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResActionComponent } from './hns-res-action.component';

describe('HnsResActionComponent', () => {
  let component: HnsResActionComponent;
  let fixture: ComponentFixture<HnsResActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
