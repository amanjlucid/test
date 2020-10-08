import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetServicingDetailComponent } from './asset-servicing-detail.component';

describe('AssetServicingDetailComponent', () => {
  let component: AssetServicingDetailComponent;
  let fixture: ComponentFixture<AssetServicingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetServicingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetServicingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
