import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationAdditionalWorkItemComponent } from './variation-additional-work-item.component';

describe('VariationAdditionalWorkItemComponent', () => {
  let component: VariationAdditionalWorkItemComponent;
  let fixture: ComponentFixture<VariationAdditionalWorkItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationAdditionalWorkItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationAdditionalWorkItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
