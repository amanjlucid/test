import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationAppendComponent } from './variation-append.component';

describe('VariationAppendComponent', () => {
  let component: VariationAppendComponent;
  let fixture: ComponentFixture<VariationAppendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationAppendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationAppendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
