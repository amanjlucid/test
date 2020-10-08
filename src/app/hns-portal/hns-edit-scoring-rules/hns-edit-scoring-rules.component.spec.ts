import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsEditScoringRulesComponent } from './hns-edit-scoring-rules.component';

describe('HnsEditScoringRulesComponent', () => {
  let component: HnsEditScoringRulesComponent;
  let fixture: ComponentFixture<HnsEditScoringRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsEditScoringRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsEditScoringRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
