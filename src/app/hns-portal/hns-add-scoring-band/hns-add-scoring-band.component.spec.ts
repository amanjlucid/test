import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsAddScoringBandComponent } from './hns-add-scoring-band.component';

describe('HnsAddScoringBandComponent', () => {
  let component: HnsAddScoringBandComponent;
  let fixture: ComponentFixture<HnsAddScoringBandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsAddScoringBandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsAddScoringBandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
