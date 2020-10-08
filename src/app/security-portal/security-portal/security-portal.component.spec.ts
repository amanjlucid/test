import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityPortalComponent } from './security-portal.component';

describe('SecurityPortalComponent', () => {
  let component: SecurityPortalComponent;
  let fixture: ComponentFixture<SecurityPortalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecurityPortalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
