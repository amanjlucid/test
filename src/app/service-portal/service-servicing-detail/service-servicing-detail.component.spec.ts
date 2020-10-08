import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceServicingDetailComponent } from './service-servicing-detail.component';

describe('ServiceServicingDetailComponent', () => {
  let component: ServiceServicingDetailComponent;
  let fixture: ComponentFixture<ServiceServicingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceServicingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceServicingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
