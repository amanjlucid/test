import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEpcDashboardComponent } from './asset-epc-dashboard.component';

describe('AssetEpcDashboardComponent', () => {
  let component: AssetEpcDashboardComponent;
  let fixture: ComponentFixture<AssetEpcDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetEpcDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetEpcDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
