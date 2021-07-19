import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenamePhaseAssetComponent } from './rename-phase-asset.component';

describe('RenamePhaseAssetComponent', () => {
  let component: RenamePhaseAssetComponent;
  let fixture: ComponentFixture<RenamePhaseAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenamePhaseAssetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RenamePhaseAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
