import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCharacteristicsComponent } from './user-characteristics.component';

describe('UserCharacteristicsComponent', () => {
  let component: UserCharacteristicsComponent;
  let fixture: ComponentFixture<UserCharacteristicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCharacteristicsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCharacteristicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
