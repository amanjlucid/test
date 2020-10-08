import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResUploadAnsImageComponent } from './hns-res-upload-ans-image.component';

describe('HnsResUploadAnsImageComponent', () => {
  let component: HnsResUploadAnsImageComponent;
  let fixture: ComponentFixture<HnsResUploadAnsImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResUploadAnsImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResUploadAnsImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
