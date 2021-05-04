import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapPackageComponent } from './swap-package.component';

describe('SwapPackageComponent', () => {
  let component: SwapPackageComponent;
  let fixture: ComponentFixture<SwapPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwapPackageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
