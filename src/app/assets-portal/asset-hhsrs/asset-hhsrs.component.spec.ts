import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetHhsrsComponent } from './asset-hhsrs.component';

describe('AssetHhsrsComponent', () => {
  let component: AssetHhsrsComponent;
  let fixture: ComponentFixture<AssetHhsrsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetHhsrsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetHhsrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
