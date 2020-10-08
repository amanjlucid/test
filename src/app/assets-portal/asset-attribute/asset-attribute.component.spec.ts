import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetAttributeComponent } from './asset-attribute.component';

describe('AssetAttributeComponent', () => {
  let component: AssetAttributeComponent;
  let fixture: ComponentFixture<AssetAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
