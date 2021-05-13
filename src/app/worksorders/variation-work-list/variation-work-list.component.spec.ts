import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationWorkListComponent } from './variation-work-list.component';

describe('VariationWorkListComponent', () => {
  let component: VariationWorkListComponent;
  let fixture: ComponentFixture<VariationWorkListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariationWorkListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationWorkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
