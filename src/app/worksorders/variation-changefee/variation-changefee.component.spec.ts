import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationChangefeeComponent } from './variation-changefee.component';

describe('VariationChangefeeComponent', () => {
  let component: VariationChangefeeComponent;
  let fixture: ComponentFixture<VariationChangefeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationChangefeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationChangefeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
