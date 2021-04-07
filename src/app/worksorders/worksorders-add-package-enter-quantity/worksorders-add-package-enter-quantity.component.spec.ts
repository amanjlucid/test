import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAddPackageEnterQuantityComponent } from './worksorders-add-package-enter-quantity.component';

describe('WorksordersAddPackageEnterQuantityComponent', () => {
  let component: WorksordersAddPackageEnterQuantityComponent;
  let fixture: ComponentFixture<WorksordersAddPackageEnterQuantityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAddPackageEnterQuantityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAddPackageEnterQuantityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
