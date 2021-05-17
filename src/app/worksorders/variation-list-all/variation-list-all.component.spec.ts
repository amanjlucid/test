import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationListAllComponent } from './variation-list-all.component';

describe('VariationListAllComponent', () => {
  let component: VariationListAllComponent;
  let fixture: ComponentFixture<VariationListAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationListAllComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationListAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
