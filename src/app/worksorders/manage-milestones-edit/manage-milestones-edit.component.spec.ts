import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMilestonesEditComponent } from './manage-milestones-edit.component';

describe('ManageMilestonesEditComponent', () => {
  let component: ManageMilestonesEditComponent;
  let fixture: ComponentFixture<ManageMilestonesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageMilestonesEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMilestonesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
