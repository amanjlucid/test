import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintAcmComponent } from './print-acm.component';

describe('PrintAcmComponent', () => {
  let component: PrintAcmComponent;
  let fixture: ComponentFixture<PrintAcmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintAcmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintAcmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
