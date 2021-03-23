import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAssetDetailComponent } from './worksorders-asset-detail.component';

describe('WorksordersAssetDetailComponent', () => {
  let component: WorksordersAssetDetailComponent;
  let fixture: ComponentFixture<WorksordersAssetDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAssetDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAssetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
