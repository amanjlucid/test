import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmEditChecklistDependenciesComponent } from './wopm-edit-checklist-dependencies.component';

describe('WopmEditChecklistDependenciesComponent', () => {
  let component: WopmEditChecklistDependenciesComponent;
  let fixture: ComponentFixture<WopmEditChecklistDependenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmEditChecklistDependenciesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmEditChecklistDependenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
