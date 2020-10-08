import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetWorksManagementComponent } from './asset-works-management.component';

describe('AssetWorksManagementComponent', () => {
  let component: AssetWorksManagementComponent;
  let fixture: ComponentFixture<AssetWorksManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetWorksManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetWorksManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
