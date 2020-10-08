import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsbestosAttachmentComponent } from './asbestos-attachment.component';

describe('AsbestosAttachmentComponent', () => {
  let component: AsbestosAttachmentComponent;
  let fixture: ComponentFixture<AsbestosAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsbestosAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsbestosAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
