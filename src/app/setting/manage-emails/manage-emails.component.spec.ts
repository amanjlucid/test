import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEmailsComponent } from './manage-emails.component';

describe('ManageEmailsComponent', () => {
  let component: ManageEmailsComponent;
  let fixture: ComponentFixture<ManageEmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageEmailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
