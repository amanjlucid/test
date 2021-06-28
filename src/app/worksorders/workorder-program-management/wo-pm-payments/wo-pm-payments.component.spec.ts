import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoPmPaymentsComponent } from './wo-pm-payments.component';

describe('WoPmInstructionAssetsComponent', () => {
  let component: WoPmPaymentsComponent;
  let fixture: ComponentFixture<WoPmPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoPmPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoPmPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
