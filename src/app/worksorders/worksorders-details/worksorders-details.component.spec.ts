import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksordersDetailsComponent } from './worksorders-details.component';

describe('WorksordersDetailsComponent', () => {
  let component: WorksordersDetailsComponent;
  let fixture: ComponentFixture<WorksordersDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksordersDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksordersDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
