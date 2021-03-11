import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersNewmanagementComponent } from './worksorders-newmanagement.component';

describe('WorksordersNewmanagementComponent', () => {
  let component: WorksordersNewmanagementComponent;
  let fixture: ComponentFixture<WorksordersNewmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersNewmanagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersNewmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
