import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCharacteristicsComponent } from './asset-characteristics.component';

describe('AssetCharacteristicsComponent', () => {
  let component: AssetCharacteristicsComponent;
  let fixture: ComponentFixture<AssetCharacteristicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetCharacteristicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetCharacteristicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
