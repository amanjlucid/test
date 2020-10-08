import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceEditNotepadComponent } from './service-edit-notepad.component';

describe('ServiceEditNotepadComponent', () => {
  let component: ServiceEditNotepadComponent;
  let fixture: ComponentFixture<ServiceEditNotepadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceEditNotepadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceEditNotepadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
