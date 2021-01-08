import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUserCategoryComponent } from './create-user-category.component';

describe('CreateUserCategoryComponent', () => {
  let component: CreateUserCategoryComponent;
  let fixture: ComponentFixture<CreateUserCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUserCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUserCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
