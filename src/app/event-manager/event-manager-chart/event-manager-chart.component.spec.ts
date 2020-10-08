import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventManagerChartComponent } from './event-manager-chart.component';

describe('EventManagerChartComponent', () => {
  let component: EventManagerChartComponent;
  let fixture: ComponentFixture<EventManagerChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventManagerChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventManagerChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
