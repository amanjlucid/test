import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAssetChecklistComponent } from './worksorders-asset-checklist.component';

describe('WorksordersAssetChecklistComponent', () => {
  let component: WorksordersAssetChecklistComponent;
  let fixture: ComponentFixture<WorksordersAssetChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAssetChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAssetChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
