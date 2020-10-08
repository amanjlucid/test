import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsReportImagesComponent } from './hns-report-images.component';

describe('HnsReportImagesComponent', () => {
  let component: HnsReportImagesComponent;
  let fixture: ComponentFixture<HnsReportImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsReportImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsReportImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
