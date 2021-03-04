import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEpcHistoryComponent } from './asset-epc-history.component';

describe('AssetEpcHistoryComponent', () => {
  let component: AssetEpcHistoryComponent;
  let fixture: ComponentFixture<AssetEpcHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetEpcHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetEpcHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
