import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetAsbestosComponent } from './asset-asbestos.component';

describe('AssetAsbestosComponent', () => {
  let component: AssetAsbestosComponent;
  let fixture: ComponentFixture<AssetAsbestosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetAsbestosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetAsbestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
