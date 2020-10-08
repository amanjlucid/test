import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsChartComponent } from './hns-chart.component';

describe('HnsChartComponent', () => {
  let component: HnsChartComponent;
  let fixture: ComponentFixture<HnsChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
