import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementRolesComponent } from './management-roles.component';

describe('ManagementRolesComponent', () => {
  let component: ManagementRolesComponent;
  let fixture: ComponentFixture<ManagementRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementRolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
