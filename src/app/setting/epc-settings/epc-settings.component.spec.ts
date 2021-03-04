import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpcSettingsComponent } from './epc-settings.component';

describe('EpcSettingsComponent', () => {
  let component: EpcSettingsComponent;
  let fixture: ComponentFixture<EpcSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpcSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpcSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
