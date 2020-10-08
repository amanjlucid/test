import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsPriorityListComponent } from './hns-priority-list.component';

describe('HnsPriorityListComponent', () => {
  let component: HnsPriorityListComponent;
  let fixture: ComponentFixture<HnsPriorityListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsPriorityListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsPriorityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
