import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoChecklistFeeComponent } from './wo-checklist-fee.component';

describe('WoChecklistFeeComponent', () => {
  let component: WoChecklistFeeComponent;
  let fixture: ComponentFixture<WoChecklistFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoChecklistFeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoChecklistFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
