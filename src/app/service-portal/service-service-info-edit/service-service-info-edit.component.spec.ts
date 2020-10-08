import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceServiceInfoEditComponent } from './service-service-info-edit.component';

describe('ServiceServiceInfoEditComponent', () => {
  let component: ServiceServiceInfoEditComponent;
  let fixture: ComponentFixture<ServiceServiceInfoEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceServiceInfoEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceServiceInfoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
