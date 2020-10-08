import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsBudgetListComponent } from './hns-budget-list.component';

describe('HnsBudgetListComponent', () => {
  let component: HnsBudgetListComponent;
  let fixture: ComponentFixture<HnsBudgetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsBudgetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsBudgetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
