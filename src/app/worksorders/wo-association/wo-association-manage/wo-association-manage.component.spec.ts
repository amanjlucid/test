import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoAssociationsManageComponent } from './wo-association-manage.component';

describe('WoAssociationsManageComponent', () => {
  let component: WoAssociationsManageComponent;
  let fixture: ComponentFixture<WoAssociationsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoAssociationsManageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoAssociationsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
