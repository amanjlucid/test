import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersAddAssetsworklistComponent } from './worksorders-add-assetsworklist.component';

describe('WorksordersAddAssetsworklistComponent', () => {
  let component: WorksordersAddAssetsworklistComponent;
  let fixture: ComponentFixture<WorksordersAddAssetsworklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersAddAssetsworklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersAddAssetsworklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
