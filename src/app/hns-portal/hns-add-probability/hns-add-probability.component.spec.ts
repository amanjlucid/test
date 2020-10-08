import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsAddProbabilityComponent } from './hns-add-probability.component';

describe('HnsAddProbabilityComponent', () => {
  let component: HnsAddProbabilityComponent;
  let fixture: ComponentFixture<HnsAddProbabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsAddProbabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsAddProbabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
