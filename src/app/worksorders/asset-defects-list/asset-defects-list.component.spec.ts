import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDefectsListComponent } from './asset-defects-list.component';

describe('AssetDefectsListComponent', () => {
  let component: AssetDefectsListComponent;
  let fixture: ComponentFixture<AssetDefectsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetDefectsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetDefectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
