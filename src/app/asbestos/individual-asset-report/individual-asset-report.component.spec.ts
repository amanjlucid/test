import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualAssetReportComponent } from './individual-asset-report.component';

describe('IndividualAssetReportComponent', () => {
  let component: IndividualAssetReportComponent;
  let fixture: ComponentFixture<IndividualAssetReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndividualAssetReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualAssetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
