import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementEditCostsComponent } from './management-edit-costs.component';

describe('ManagementEditCostsComponent', () => {
  let component: ManagementEditCostsComponent;
  let fixture: ComponentFixture<ManagementEditCostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementEditCostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementEditCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
