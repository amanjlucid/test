import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedReportComponent } from './published-report.component';

describe('PublishedReportComponent', () => {
  let component: PublishedReportComponent;
  let fixture: ComponentFixture<PublishedReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublishedReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
