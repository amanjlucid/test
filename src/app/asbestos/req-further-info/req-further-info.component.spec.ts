import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReqFurtherInfoComponent } from './req-further-info.component';

describe('ReqFurtherInfoComponent', () => {
  let component: ReqFurtherInfoComponent;
  let fixture: ComponentFixture<ReqFurtherInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReqFurtherInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReqFurtherInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
