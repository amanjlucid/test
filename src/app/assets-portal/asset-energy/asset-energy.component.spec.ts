import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEnergyComponent } from './asset-energy.component';

describe('AssetEnergyComponent', () => {
  let component: AssetEnergyComponent;
  let fixture: ComponentFixture<AssetEnergyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetEnergyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
