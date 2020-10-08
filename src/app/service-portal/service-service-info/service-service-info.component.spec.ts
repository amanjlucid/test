import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceServiceInfoComponent } from './service-service-info.component';

describe('ServiceServiceInfoComponent', () => {
  let component: ServiceServiceInfoComponent;
  let fixture: ComponentFixture<ServiceServiceInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceServiceInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceServiceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
