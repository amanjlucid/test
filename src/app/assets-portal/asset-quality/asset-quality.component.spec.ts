import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetQualityComponent } from './asset-quality.component';

describe('AssetQualityComponent', () => {
  let component: AssetQualityComponent;
  let fixture: ComponentFixture<AssetQualityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetQualityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
