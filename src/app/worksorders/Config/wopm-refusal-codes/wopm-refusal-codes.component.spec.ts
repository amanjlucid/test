import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmRefusalCodesComponent } from './wopm-refusal-codes.component';

describe('WopmRefusalCodesComponent', () => {
  let component: WopmRefusalCodesComponent;
  let fixture: ComponentFixture<WopmRefusalCodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmRefusalCodesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmRefusalCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
