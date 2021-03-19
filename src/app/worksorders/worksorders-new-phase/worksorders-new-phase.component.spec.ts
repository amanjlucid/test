import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersNewPhaseComponent } from './worksorders-new-phase.component';

describe('WorksordersNewPhaseComponent', () => {
  let component: WorksordersNewPhaseComponent;
  let fixture: ComponentFixture<WorksordersNewPhaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersNewPhaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersNewPhaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
