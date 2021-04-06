import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAssetChecklistPredecessorsComponent } from './worksorders-asset-checklist-predecessors.component';

describe('WorksordersAssetChecklistPredecessorsComponent', () => {
  let component: WorksordersAssetChecklistPredecessorsComponent;
  let fixture: ComponentFixture<WorksordersAssetChecklistPredecessorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAssetChecklistPredecessorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAssetChecklistPredecessorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
