import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventParametersComponent } from './event-parameters.component';

describe('EventParametersComponent', () => {
  let component: EventParametersComponent;
  let fixture: ComponentFixture<EventParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventParametersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
