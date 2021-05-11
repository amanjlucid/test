import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmConfigComponent } from './wopm-config.component';

describe('WopmConfigComponent', () => {
  let component: WopmConfigComponent;
  let fixture: ComponentFixture<WopmConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
