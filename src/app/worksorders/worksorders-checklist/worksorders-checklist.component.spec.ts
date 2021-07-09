import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersChecklistComponent } from './worksorders-checklist.component';

describe('WorksordersChecklistComponent', () => {
  let component: WorksordersChecklistComponent;
  let fixture: ComponentFixture<WorksordersChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
