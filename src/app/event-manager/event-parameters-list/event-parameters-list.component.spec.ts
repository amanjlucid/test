import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventParametersListComponent } from './event-parameters-list.component';

describe('EventParametersListComponent', () => {
  let component: EventParametersListComponent;
  let fixture: ComponentFixture<EventParametersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventParametersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventParametersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
