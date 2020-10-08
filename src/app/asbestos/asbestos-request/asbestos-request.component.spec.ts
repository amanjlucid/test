import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsbestosRequestComponent } from './asbestos-request.component';

describe('AsbestosRequestComponent', () => {
  let component: AsbestosRequestComponent;
  let fixture: ComponentFixture<AsbestosRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsbestosRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsbestosRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
