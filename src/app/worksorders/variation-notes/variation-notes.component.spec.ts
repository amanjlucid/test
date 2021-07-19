import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationNotesComponent } from './variation-notes.component';

describe('VariationNotesComponent', () => {
  let component: VariationNotesComponent;
  let fixture: ComponentFixture<VariationNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
