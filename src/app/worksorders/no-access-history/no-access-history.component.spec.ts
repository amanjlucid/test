import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoAccessHistoryComponent } from './no-access-history.component';

describe('NoAccessHistoryComponent', () => {
  let component: NoAccessHistoryComponent;
  let fixture: ComponentFixture<NoAccessHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoAccessHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoAccessHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
