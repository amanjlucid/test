import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEpcRecommendationsComponent } from './asset-epc-recommendations.component';

describe('AssetEpcRecommendationsComponent', () => {
  let component: AssetEpcRecommendationsComponent;
  let fixture: ComponentFixture<AssetEpcRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetEpcRecommendationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetEpcRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
