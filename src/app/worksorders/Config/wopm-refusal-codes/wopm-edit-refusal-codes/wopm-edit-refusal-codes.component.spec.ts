import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmEditRefusalCodesComponent } from './wopm-edit-refusal-codes.component';

describe('WopmEditRefusalCodesComponent', () => {
  let component: WopmEditRefusalCodesComponent;
  let fixture: ComponentFixture<WopmEditRefusalCodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmEditRefusalCodesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmEditRefusalCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
