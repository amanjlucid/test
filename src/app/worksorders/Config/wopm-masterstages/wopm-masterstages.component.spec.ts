import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmMasterstagesComponent } from './wopm-masterstages.component';

describe('WopmMasterstagesComponent', () => {
  let component: WopmMasterstagesComponent;
  let fixture: ComponentFixture<WopmMasterstagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmMasterstagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmMasterstagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
