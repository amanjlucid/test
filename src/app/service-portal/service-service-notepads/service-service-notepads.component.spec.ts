import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceServiceNotepadsComponent } from './service-service-notepads.component';

describe('ServiceServiceNotepadsComponent', () => {
  let component: ServiceServiceNotepadsComponent;
  let fixture: ComponentFixture<ServiceServiceNotepadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceServiceNotepadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceServiceNotepadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
