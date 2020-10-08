import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsbestosViewAttachmentComponent } from './asbestos-view-attachment.component';

describe('AsbestosViewAttachmentComponent', () => {
  let component: AsbestosViewAttachmentComponent;
  let fixture: ComponentFixture<AsbestosViewAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsbestosViewAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsbestosViewAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
