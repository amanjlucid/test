import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsPortalComponent } from './assets-portal.component';

describe('AssetsPortalComponent', () => {
  let component: AssetsPortalComponent;
  let fixture: ComponentFixture<AssetsPortalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsPortalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
