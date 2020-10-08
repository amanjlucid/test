import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsSeverityListComponent } from './hns-severity-list.component';

describe('HnsSeverityListComponent', () => {
  let component: HnsSeverityListComponent;
  let fixture: ComponentFixture<HnsSeverityListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsSeverityListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsSeverityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
