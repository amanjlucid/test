import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderCompletionComponent } from './workorder-completion.component';

describe('WorkOrderCompletionComponent', () => {
  let component: WorkOrderCompletionComponent;
  let fixture: ComponentFixture<WorkOrderCompletionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderCompletionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
