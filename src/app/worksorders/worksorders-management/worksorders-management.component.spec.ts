import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersManagementComponent } from './worksorders-management.component';

describe('WorksordersManagementComponent', () => {
  let component: WorksordersManagementComponent;
  let fixture: ComponentFixture<WorksordersManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
