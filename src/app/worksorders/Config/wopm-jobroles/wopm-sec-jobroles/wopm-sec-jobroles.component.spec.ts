import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmSecJobrolesComponent } from './wopm-sec-jobroles.component';

describe('WopmSecJobrolesComponent', () => {
  let component: WopmSecJobrolesComponent;
  let fixture: ComponentFixture<WopmSecJobrolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmSecJobrolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmSecJobrolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
