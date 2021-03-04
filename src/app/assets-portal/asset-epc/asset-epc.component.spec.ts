import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEpcComponent } from './asset-epc.component';

describe('AssetEpcComponent', () => {
  let component: AssetEpcComponent;
  let fixture: ComponentFixture<AssetEpcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetEpcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetEpcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
