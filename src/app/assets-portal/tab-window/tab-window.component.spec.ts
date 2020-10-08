import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabWindowComponent } from './tab-window.component';

describe('TabWindowComponent', () => {
  let component: TabWindowComponent;
  let fixture: ComponentFixture<TabWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
