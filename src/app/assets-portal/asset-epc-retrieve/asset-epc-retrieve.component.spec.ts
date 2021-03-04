import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEpcRetrieveComponent } from './asset-epc-retrieve.component';

describe('AssetEpcRetrieveComponent', () => {
  let component: AssetEpcRetrieveComponent;
  let fixture: ComponentFixture<AssetEpcRetrieveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetEpcRetrieveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetEpcRetrieveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
