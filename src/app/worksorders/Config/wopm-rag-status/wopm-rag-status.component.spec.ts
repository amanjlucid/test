import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmRagStatusComponent } from './wopm-rag-status.component';

describe('WopmRagStatusComponent', () => {
  let component: WopmRagStatusComponent;
  let fixture: ComponentFixture<WopmRagStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmRagStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmRagStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
