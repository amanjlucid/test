import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAddAssetsComponent } from './worksorders-add-assets.component';

describe('WorksordersAddAssetsComponent', () => {
  let component: WorksordersAddAssetsComponent;
  let fixture: ComponentFixture<WorksordersAddAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAddAssetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAddAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
