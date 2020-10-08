import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsScoringBandsComponent } from './hns-scoring-bands.component';

describe('HnsScoringBandsComponent', () => {
  let component: HnsScoringBandsComponent;
  let fixture: ComponentFixture<HnsScoringBandsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsScoringBandsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsScoringBandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
