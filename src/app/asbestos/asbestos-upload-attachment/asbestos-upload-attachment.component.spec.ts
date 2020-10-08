import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsbestosUploadAttachmentComponent } from './asbestos-upload-attachment.component';

describe('AsbestosUploadAttachmentComponent', () => {
  let component: AsbestosUploadAttachmentComponent;
  let fixture: ComponentFixture<AsbestosUploadAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsbestosUploadAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsbestosUploadAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
