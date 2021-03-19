import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersPackageMappingComponent } from './worksorders-package-mapping.component';

describe('WorksordersPackageMappingComponent', () => {
  let component: WorksordersPackageMappingComponent;
  let fixture: ComponentFixture<WorksordersPackageMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersPackageMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersPackageMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
