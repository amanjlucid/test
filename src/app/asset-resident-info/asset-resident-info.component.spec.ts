import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetResidentInfoComponent } from './asset-resident-info.component';

describe('AssetResidentInfoComponent', () => {
  let component: AssetResidentInfoComponent;
  let fixture: ComponentFixture<AssetResidentInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetResidentInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetResidentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
