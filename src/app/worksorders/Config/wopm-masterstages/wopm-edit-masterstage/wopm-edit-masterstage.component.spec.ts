import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmEditMasterstageComponent } from './wopm-edit-masterstage.component';

describe('WopmEditMasterstageComponent', () => {
  let component: WopmEditMasterstageComponent;
  let fixture: ComponentFixture<WopmEditMasterstageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmEditMasterstageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmEditMasterstageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
