import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksOrderSettingsComponent } from './works-order-settings.component';

describe('WorksOrderSettingsComponent', () => {
  let component: WorksOrderSettingsComponent;
  let fixture: ComponentFixture<WorksOrderSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorksOrderSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksOrderSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
