import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEventTaskDetailsComponent } from './user-event-task-details.component';

describe('UserEventTaskDetailsComponent', () => {
  let component: UserEventTaskDetailsComponent;
  let fixture: ComponentFixture<UserEventTaskDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserEventTaskDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEventTaskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
