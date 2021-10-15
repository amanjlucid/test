import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignGroupComponent } from './assign-group.component';

describe('AssignGroupComponent', () => {
  let component: AssignGroupComponent;
  let fixture: ComponentFixture<AssignGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
