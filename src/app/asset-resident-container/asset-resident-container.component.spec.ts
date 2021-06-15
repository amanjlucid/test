import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetResidentContainerComponent } from './asset-resident-container.component';

describe('AssetResidentContainerComponent', () => {
  let component: AssetResidentContainerComponent;
  let fixture: ComponentFixture<AssetResidentContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetResidentContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetResidentContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
