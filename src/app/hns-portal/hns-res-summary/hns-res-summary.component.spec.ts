import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResSummaryComponent } from './hns-res-summary.component';

describe('HnsResSummaryComponent', () => {
  let component: HnsResSummaryComponent;
  let fixture: ComponentFixture<HnsResSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
