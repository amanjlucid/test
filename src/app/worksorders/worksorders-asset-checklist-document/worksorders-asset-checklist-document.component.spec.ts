import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAssetChecklistDocumentComponent } from './worksorders-asset-checklist-document.component';

describe('WorksordersAssetChecklistDocumentComponent', () => {
  let component: WorksordersAssetChecklistDocumentComponent;
  let fixture: ComponentFixture<WorksordersAssetChecklistDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAssetChecklistDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAssetChecklistDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
