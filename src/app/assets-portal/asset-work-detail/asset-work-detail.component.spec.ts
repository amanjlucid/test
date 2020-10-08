import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetWorkDetailComponent } from './asset-work-detail.component';

describe('AssetWorkDetailComponent', () => {
  let component: AssetWorkDetailComponent;
  let fixture: ComponentFixture<AssetWorkDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetWorkDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetWorkDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
