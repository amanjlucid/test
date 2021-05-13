import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationNewComponent } from './variation-new.component';

describe('VariationNewComponent', () => {
  let component: VariationNewComponent;
  let fixture: ComponentFixture<VariationNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
