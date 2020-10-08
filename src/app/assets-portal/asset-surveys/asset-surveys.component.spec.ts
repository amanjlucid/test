import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSurveysComponent } from './asset-surveys.component';

describe('AssetSurveysComponent', () => {
  let component: AssetSurveysComponent;
  let fixture: ComponentFixture<AssetSurveysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetSurveysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSurveysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
