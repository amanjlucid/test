import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaseChecklistComponent } from './phase-checklist.component';

describe('PhaseChecklistComponent', () => {
  let component: PhaseChecklistComponent;
  let fixture: ComponentFixture<PhaseChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhaseChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
