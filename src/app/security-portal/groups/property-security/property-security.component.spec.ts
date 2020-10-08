import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertySecurityComponent } from './property-security.component';

describe('PropertySecurityComponent', () => {
  let component: PropertySecurityComponent;
  let fixture: ComponentFixture<PropertySecurityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertySecurityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertySecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
