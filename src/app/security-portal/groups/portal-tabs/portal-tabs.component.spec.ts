import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalTabsComponent } from './portal-tabs.component';

describe('PortalTabsComponent', () => {
  let component: PortalTabsComponent;
  let fixture: ComponentFixture<PortalTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortalTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
