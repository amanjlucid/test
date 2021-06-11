import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmEditRagStatusComponent } from './wopm-edit-rag-status.component';

describe('WopmEditRagStatusComponent', () => {
  let component: WopmEditRagStatusComponent;
  let fixture: ComponentFixture<WopmEditRagStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmEditRagStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmEditRagStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
