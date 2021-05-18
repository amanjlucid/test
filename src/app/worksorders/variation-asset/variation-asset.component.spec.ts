import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationAssetComponent } from './variation-asset.component';

describe('VariationAssetComponent', () => {
  let component: VariationAssetComponent;
  let fixture: ComponentFixture<VariationAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationAssetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
