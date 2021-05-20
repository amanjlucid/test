import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoProgramManagmentInstructionComponent } from './wo-program-management-instructions.component';

describe('WoProgramManagmentInstructionComponent', () => {
  let component: WoProgramManagmentInstructionComponent;
  let fixture: ComponentFixture<WoProgramManagmentInstructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoProgramManagmentInstructionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoProgramManagmentInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
