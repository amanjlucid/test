import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsSettingsComponent } from './hns-settings.component';

describe('HnsSettingsComponent', () => {
  let component: HnsSettingsComponent;
  let fixture: ComponentFixture<HnsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
