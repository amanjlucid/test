import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmChecklistMasterComponent } from './wopm-checklist-master.component';

describe('WopmChecklistMasterComponent', () => {
  let component: WopmChecklistMasterComponent;
  let fixture: ComponentFixture<WopmChecklistMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmChecklistMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmChecklistMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
