import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResInfoEditAnsComponent } from './hns-res-info-edit-ans.component';

describe('HnsResInfoEditAnsComponent', () => {
  let component: HnsResInfoEditAnsComponent;
  let fixture: ComponentFixture<HnsResInfoEditAnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResInfoEditAnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResInfoEditAnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
