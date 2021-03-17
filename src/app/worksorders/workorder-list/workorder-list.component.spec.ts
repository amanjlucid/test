import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderListComponent } from './workorder-list.component';

describe('WorkorderListComponent', () => {
  let component: WorkorderListComponent;
  let fixture: ComponentFixture<WorkorderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
