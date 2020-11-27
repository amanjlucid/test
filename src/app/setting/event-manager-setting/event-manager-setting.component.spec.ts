import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventManagerSettingComponent } from './event-manager-setting.component';

describe('EventManagerSettingComponent', () => {
  let component: EventManagerSettingComponent;
  let fixture: ComponentFixture<EventManagerSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventManagerSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventManagerSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
