import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersEditchecklistComponent } from './worksorders-editchecklist.component';

describe('WorksordersEditchecklistComponent', () => {
  let component: WorksordersEditchecklistComponent;
  let fixture: ComponentFixture<WorksordersEditchecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersEditchecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersEditchecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
