import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementEditRolesComponent } from './management-edit-roles.component';

describe('ManagementEditRolesComponent', () => {
  let component: ManagementEditRolesComponent;
  let fixture: ComponentFixture<ManagementEditRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementEditRolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementEditRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
