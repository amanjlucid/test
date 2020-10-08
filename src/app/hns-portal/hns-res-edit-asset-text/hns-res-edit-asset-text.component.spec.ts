import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResEditAssetTextComponent } from './hns-res-edit-asset-text.component';

describe('HnsResEditAssetTextComponent', () => {
  let component: HnsResEditAssetTextComponent;
  let fixture: ComponentFixture<HnsResEditAssetTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResEditAssetTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResEditAssetTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
