import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationPkzEnterQtyComponent } from './variation-pkz-enter-qty.component';

describe('VariationPkzEnterQtyComponent', () => {
  let component: VariationPkzEnterQtyComponent;
  let fixture: ComponentFixture<VariationPkzEnterQtyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationPkzEnterQtyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationPkzEnterQtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
