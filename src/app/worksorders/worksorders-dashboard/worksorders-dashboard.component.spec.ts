import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersDashboardComponent } from './worksorders-dashboard.component';

describe('WorksordersDashboardComponent', () => {
  let component: WorksordersDashboardComponent;
  let fixture: ComponentFixture<WorksordersDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
