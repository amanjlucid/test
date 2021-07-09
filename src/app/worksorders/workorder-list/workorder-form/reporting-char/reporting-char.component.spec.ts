import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingCharComponent } from './reporting-char.component';

describe('ReportingCharComponent', () => {
  let component: ReportingCharComponent;
  let fixture: ComponentFixture<ReportingCharComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportingCharComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingCharComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
