import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsbestosManageRequestComponent } from './asbestos-manage-request.component';

describe('AsbestosManageRequestComponent', () => {
  let component: AsbestosManageRequestComponent;
  let fixture: ComponentFixture<AsbestosManageRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsbestosManageRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsbestosManageRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
