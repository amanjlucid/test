import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTaskDataComponent } from './user-task-data.component';

describe('UserTaskDataComponent', () => {
  let component: UserTaskDataComponent;
  let fixture: ComponentFixture<UserTaskDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserTaskDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTaskDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
