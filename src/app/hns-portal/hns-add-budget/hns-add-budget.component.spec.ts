import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsAddBudgetComponent } from './hns-add-budget.component';

describe('HnsAddBudgetComponent', () => {
  let component: HnsAddBudgetComponent;
  let fixture: ComponentFixture<HnsAddBudgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsAddBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsAddBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
