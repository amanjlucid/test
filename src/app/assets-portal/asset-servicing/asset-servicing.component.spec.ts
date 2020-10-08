import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetServicingComponent } from './asset-servicing.component';

describe('AssetServicingComponent', () => {
  let component: AssetServicingComponent;
  let fixture: ComponentFixture<AssetServicingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetServicingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetServicingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
