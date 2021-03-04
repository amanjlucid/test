import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEpcDataComponent } from './asset-epc-data.component';

describe('AssetEpcDataComponent', () => {
  let component: AssetEpcDataComponent;
  let fixture: ComponentFixture<AssetEpcDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetEpcDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetEpcDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
