import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResultComponent } from './hns-result.component';

describe('HnsResultComponent', () => {
  let component: HnsResultComponent;
  let fixture: ComponentFixture<HnsResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
