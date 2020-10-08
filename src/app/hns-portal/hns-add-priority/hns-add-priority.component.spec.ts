import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsAddPriorityComponent } from './hns-add-priority.component';

describe('HnsAddPriorityComponent', () => {
  let component: HnsAddPriorityComponent;
  let fixture: ComponentFixture<HnsAddPriorityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsAddPriorityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsAddPriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
