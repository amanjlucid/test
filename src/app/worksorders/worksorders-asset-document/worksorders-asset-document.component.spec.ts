import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAssetDocumentComponent } from './worksorders-asset-document.component';

describe('WorksordersAssetDocumentComponent', () => {
  let component: WorksordersAssetDocumentComponent;
  let fixture: ComponentFixture<WorksordersAssetDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAssetDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAssetDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
