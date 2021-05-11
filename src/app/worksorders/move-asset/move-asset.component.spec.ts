import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveAssetComponent } from './move-asset.component';

describe('MoveAssetComponent', () => {
  let component: MoveAssetComponent;
  let fixture: ComponentFixture<MoveAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveAssetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
