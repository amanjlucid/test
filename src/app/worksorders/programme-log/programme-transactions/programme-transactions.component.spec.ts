import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramTransactionsComponent } from './programme-transactions.component';

describe('ProgramTransactionsComponent', () => {
  let component: ProgramTransactionsComponent;
  let fixture: ComponentFixture<ProgramTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramTransactionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
