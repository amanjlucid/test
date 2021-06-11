import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramLogComponent } from './programme-log.component';

describe('ProgramLogComponent', () => {
  let component: ProgramLogComponent;
  let fixture: ComponentFixture<ProgramLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
