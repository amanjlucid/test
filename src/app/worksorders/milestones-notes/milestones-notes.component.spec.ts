import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestonesNotesComponent } from './milestones-notes.component';

describe('MilestonesNotesComponent', () => {
  let component: MilestonesNotesComponent;
  let fixture: ComponentFixture<MilestonesNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MilestonesNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestonesNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
