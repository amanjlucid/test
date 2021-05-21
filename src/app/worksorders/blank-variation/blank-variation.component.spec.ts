import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlankVariationComponent } from './blank-variation.component';

describe('BlankVariationComponent', () => {
  let component: BlankVariationComponent;
  let fixture: ComponentFixture<BlankVariationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlankVariationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlankVariationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
