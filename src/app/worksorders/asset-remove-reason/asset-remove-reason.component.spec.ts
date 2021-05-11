import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetRemoveReasonComponent } from './asset-remove-reason.component';

describe('AssetRemoveReasonComponent', () => {
  let component: AssetRemoveReasonComponent;
  let fixture: ComponentFixture<AssetRemoveReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetRemoveReasonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetRemoveReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
