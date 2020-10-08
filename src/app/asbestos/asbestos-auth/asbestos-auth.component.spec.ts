import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsbestosAuthComponent } from './asbestos-auth.component';

describe('AsbestosAuthComponent', () => {
  let component: AsbestosAuthComponent;
  let fixture: ComponentFixture<AsbestosAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsbestosAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsbestosAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
