import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsCharacteristicComponent } from './hns-characteristic.component';

describe('HnsCharacteristicComponent', () => {
  let component: HnsCharacteristicComponent;
  let fixture: ComponentFixture<HnsCharacteristicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsCharacteristicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsCharacteristicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
