import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigntoOtherComponent } from './assignto-other.component';

describe('AssigntoOtherComponent', () => {
  let component: AssigntoOtherComponent;
  let fixture: ComponentFixture<AssigntoOtherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssigntoOtherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssigntoOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
