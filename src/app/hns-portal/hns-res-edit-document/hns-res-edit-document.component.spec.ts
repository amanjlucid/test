import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResEditDocumentComponent } from './hns-res-edit-document.component';

describe('HnsResEditDocumentComponent', () => {
  let component: HnsResEditDocumentComponent;
  let fixture: ComponentFixture<HnsResEditDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResEditDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResEditDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
