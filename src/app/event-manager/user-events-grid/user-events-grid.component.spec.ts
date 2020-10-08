import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEventsGridComponent } from './user-events-grid.component';

describe('UserEventsGridComponent', () => {
  let component: UserEventsGridComponent;
  let fixture: ComponentFixture<UserEventsGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEventsGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEventsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
