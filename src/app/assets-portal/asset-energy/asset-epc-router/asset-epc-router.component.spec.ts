import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEpcRouterComponent } from './asset-epc-router.component';

describe('AssetEpcRouterComponent', () => {
  let component: AssetEpcRouterComponent;
  let fixture: ComponentFixture<AssetEpcRouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetEpcRouterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetEpcRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
