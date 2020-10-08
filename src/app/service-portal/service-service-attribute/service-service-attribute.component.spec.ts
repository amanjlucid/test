import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceServiceAttributeComponent } from './service-service-attribute.component';

describe('ServiceServiceAttributeComponent', () => {
  let component: ServiceServiceAttributeComponent;
  let fixture: ComponentFixture<ServiceServiceAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceServiceAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceServiceAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
