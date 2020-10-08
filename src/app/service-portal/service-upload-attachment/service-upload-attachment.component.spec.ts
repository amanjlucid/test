import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceUploadAttachmentComponent } from './service-upload-attachment.component';

describe('ServiceUploadAttachmentComponent', () => {
  let component: ServiceUploadAttachmentComponent;
  let fixture: ComponentFixture<ServiceUploadAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceUploadAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceUploadAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
