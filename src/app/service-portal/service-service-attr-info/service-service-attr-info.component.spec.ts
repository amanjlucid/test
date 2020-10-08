import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceServiceAttrInfoComponent } from './service-service-attr-info.component';

describe('ServiceServiceAttrInfoComponent', () => {
  let component: ServiceServiceAttrInfoComponent;
  let fixture: ComponentFixture<ServiceServiceAttrInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceServiceAttrInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceServiceAttrInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
