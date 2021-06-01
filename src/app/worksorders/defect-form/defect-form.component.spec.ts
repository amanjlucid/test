import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectFormComponent } from './defect-form.component';

describe('DefectFormComponent', () => {
  let component: DefectFormComponent;
  let fixture: ComponentFixture<DefectFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefectFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
