import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmContractTermsComponent } from './wopm-contract-terms.component';

describe('WopmContractTermsComponent', () => {
  let component: WopmContractTermsComponent;
  let fixture: ComponentFixture<WopmContractTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmContractTermsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmContractTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
