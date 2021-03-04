import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersRouterComponent } from './worksorders-router.component';

describe('WorksordersRouterComponent', () => {
  let component: WorksordersRouterComponent;
  let fixture: ComponentFixture<WorksordersRouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersRouterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
