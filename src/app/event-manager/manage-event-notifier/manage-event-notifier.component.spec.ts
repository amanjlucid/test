import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEventNotifierComponent } from './manage-event-notifier.component';

describe('ManageEventNotifierComponent', () => {
  let component: ManageEventNotifierComponent;
  let fixture: ComponentFixture<ManageEventNotifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageEventNotifierComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageEventNotifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
