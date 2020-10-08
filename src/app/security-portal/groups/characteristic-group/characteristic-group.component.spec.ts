import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacteristicGroupComponent } from './characteristic-group.component';

describe('CharacteristicGroupComponent', () => {
  let component: CharacteristicGroupComponent;
  let fixture: ComponentFixture<CharacteristicGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacteristicGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
