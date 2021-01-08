import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetUserCategoryComponent } from './set-user-category.component';

describe('SetUserCategoryComponent', () => {
  let component: SetUserCategoryComponent;
  let fixture: ComponentFixture<SetUserCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetUserCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetUserCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
