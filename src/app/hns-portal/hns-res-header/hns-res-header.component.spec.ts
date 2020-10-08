import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResHeaderComponent } from './hns-res-header.component';

describe('HnsResHeaderComponent', () => {
  let component: HnsResHeaderComponent;
  let fixture: ComponentFixture<HnsResHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
