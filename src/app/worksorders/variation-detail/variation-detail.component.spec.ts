import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationDetailComponent } from './variation-detail.component';

describe('VariationDetailComponent', () => {
  let component: VariationDetailComponent;
  let fixture: ComponentFixture<VariationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
