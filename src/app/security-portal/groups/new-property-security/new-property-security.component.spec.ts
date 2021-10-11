import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPropertySecurityComponent } from './new-property-security.component';

describe('NewPropertySecurityComponent', () => {
  let component: NewPropertySecurityComponent;
  let fixture: ComponentFixture<NewPropertySecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPropertySecurityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPropertySecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
