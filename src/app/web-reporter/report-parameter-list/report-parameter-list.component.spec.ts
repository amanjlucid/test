import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportParameterListComponent } from './report-parameter-list.component';

describe('ReportParameterListComponent', () => {
  let component: ReportParameterListComponent;
  let fixture: ComponentFixture<ReportParameterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportParameterListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportParameterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
