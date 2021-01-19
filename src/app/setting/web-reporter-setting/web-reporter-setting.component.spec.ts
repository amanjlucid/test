import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebReporterSettingComponent } from './web-reporter-setting.component';

describe('WebReporterSettingComponent', () => {
  let component: WebReporterSettingComponent;
  let fixture: ComponentFixture<WebReporterSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebReporterSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebReporterSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
