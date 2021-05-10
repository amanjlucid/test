import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAssetChecklistEditDescriptionComponent } from './worksorders-asset-checklist-edit-description.component';

describe('WorksordersAssetChecklistEditDescriptionComponent', () => {
  let component: WorksordersAssetChecklistEditDescriptionComponent;
  let fixture: ComponentFixture<WorksordersAssetChecklistEditDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAssetChecklistEditDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAssetChecklistEditDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
