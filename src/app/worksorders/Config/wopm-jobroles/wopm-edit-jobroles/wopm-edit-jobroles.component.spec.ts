import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmEditJobrolesComponent } from './wopm-edit-jobroles.component';

describe('WopmEditJobrolesComponent', () => {
  let component: WopmEditJobrolesComponent;
  let fixture: ComponentFixture<WopmEditJobrolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmEditJobrolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmEditJobrolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
