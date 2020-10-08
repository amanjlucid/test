import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceChartComponent } from './service-chart.component';

describe('ServiceChartComponent', () => {
  let component: ServiceChartComponent;
  let fixture: ComponentFixture<ServiceChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
