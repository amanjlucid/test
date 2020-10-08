import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsbestosEditAttachmentComponent } from './asbestos-edit-attachment.component';

describe('AsbestosEditAttachmentComponent', () => {
  let component: AsbestosEditAttachmentComponent;
  let fixture: ComponentFixture<AsbestosEditAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsbestosEditAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsbestosEditAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
