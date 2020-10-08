import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceResidentContactsComponent } from './service-resident-contacts.component';

describe('ServiceResidentContactsComponent', () => {
  let component: ServiceResidentContactsComponent;
  let fixture: ComponentFixture<ServiceResidentContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceResidentContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceResidentContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
