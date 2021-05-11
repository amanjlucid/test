import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmEditChecklistMasterComponent } from './wopm-edit-checklist-master.component';

describe('WopmEditChecklistMasterComponent', () => {
  let component: WopmEditChecklistMasterComponent;
  let fixture: ComponentFixture<WopmEditChecklistMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmEditChecklistMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmEditChecklistMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
