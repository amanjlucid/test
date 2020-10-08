import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetWagDetailComponent } from './asset-wag-detail.component';

describe('AssetWagDetailComponent', () => {
  let component: AssetWagDetailComponent;
  let fixture: ComponentFixture<AssetWagDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetWagDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetWagDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
