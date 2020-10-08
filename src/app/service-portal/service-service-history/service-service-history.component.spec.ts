import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceServiceHistoryComponent } from './service-service-history.component';

describe('ServiceServiceHistoryComponent', () => {
  let component: ServiceServiceHistoryComponent;
  let fixture: ComponentFixture<ServiceServiceHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceServiceHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceServiceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
