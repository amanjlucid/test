import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestonesDocumentListComponent } from './milestones-document-list.component';

describe('MilestonesDocumentListComponent', () => {
  let component: MilestonesDocumentListComponent;
  let fixture: ComponentFixture<MilestonesDocumentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MilestonesDocumentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestonesDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
