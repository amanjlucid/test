import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementCostsComponent } from './management-costs.component';

describe('ManagementCostsComponent', () => {
  let component: ManagementCostsComponent;
  let fixture: ComponentFixture<ManagementCostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementCostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
