import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementSorComponent } from './management-sor.component';

describe('ManagementSorComponent', () => {
  let component: ManagementSorComponent;
  let fixture: ComponentFixture<ManagementSorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementSorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementSorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
