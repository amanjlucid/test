import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmJobrolesComponent } from './wopm-jobroles.component';

describe('WopmJobrolesComponent', () => {
  let component: WopmJobrolesComponent;
  let fixture: ComponentFixture<WopmJobrolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmJobrolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmJobrolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
