import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChartSharedComponent } from './dashboard-chart-shared.component';

describe('DashboardChartSharedComponent', () => {
  let component: DashboardChartSharedComponent;
  let fixture: ComponentFixture<DashboardChartSharedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardChartSharedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardChartSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
