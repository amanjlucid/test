import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAssetChecklistUploadDocComponent } from './worksorders-asset-checklist-upload-doc.component';

describe('WorksordersAssetChecklistUploadDocComponent', () => {
  let component: WorksordersAssetChecklistUploadDocComponent;
  let fixture: ComponentFixture<WorksordersAssetChecklistUploadDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAssetChecklistUploadDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAssetChecklistUploadDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
