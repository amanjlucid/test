import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAddPackageToWorklistComponent } from './worksorders-add-package-to-worklist.component';

describe('WorksordersAddPackageToWorklistComponent', () => {
  let component: WorksordersAddPackageToWorklistComponent;
  let fixture: ComponentFixture<WorksordersAddPackageToWorklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAddPackageToWorklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAddPackageToWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
