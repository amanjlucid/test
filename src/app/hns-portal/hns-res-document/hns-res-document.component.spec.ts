import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResDocumentComponent } from './hns-res-document.component';

describe('HnsResDocumentComponent', () => {
  let component: HnsResDocumentComponent;
  let fixture: ComponentFixture<HnsResDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
