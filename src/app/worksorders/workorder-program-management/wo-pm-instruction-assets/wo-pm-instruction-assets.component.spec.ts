import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoPmInstructionAssetsComponent } from './wo-pm-instruction-assets.component';

describe('WoPmInstructionAssetsComponent', () => {
  let component: WoPmInstructionAssetsComponent;
  let fixture: ComponentFixture<WoPmInstructionAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoPmInstructionAssetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoPmInstructionAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
