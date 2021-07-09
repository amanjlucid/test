import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoEditcommentComponent } from './wo-editcomment.component';

describe('WoEditcommentComponent', () => {
  let component: WoEditcommentComponent;
  let fixture: ComponentFixture<WoEditcommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoEditcommentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoEditcommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
