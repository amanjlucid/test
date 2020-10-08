import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSettingsComponent } from './service-settings.component';

describe('ServiceSettingsComponent', () => {
  let component: ServiceSettingsComponent;
  let fixture: ComponentFixture<ServiceSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
