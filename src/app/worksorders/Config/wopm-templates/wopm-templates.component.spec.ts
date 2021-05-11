import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmTemplatesComponent } from './wopm-templates.component';

describe('WopmTemplatesComponent', () => {
  let component: WopmTemplatesComponent;
  let fixture: ComponentFixture<WopmTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
