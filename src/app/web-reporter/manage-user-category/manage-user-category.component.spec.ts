import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUserCategoryComponent } from './manage-user-category.component';

describe('ManageUserCategoryComponent', () => {
  let component: ManageUserCategoryComponent;
  let fixture: ComponentFixture<ManageUserCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageUserCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUserCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
