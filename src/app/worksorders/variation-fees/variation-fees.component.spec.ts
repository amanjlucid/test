import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationFeesComponent } from './variation-fees.component';

describe('VariationFeesComponent', () => {
  let component: VariationFeesComponent;
  let fixture: ComponentFixture<VariationFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationFeesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
