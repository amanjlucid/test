import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportParameterComponent } from './report-parameter.component';

describe('ReportParameterComponent', () => {
  let component: ReportParameterComponent;
  let fixture: ComponentFixture<ReportParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportParameterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
