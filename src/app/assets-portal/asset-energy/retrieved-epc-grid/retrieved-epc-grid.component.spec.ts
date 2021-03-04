import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrievedEpcGridComponent } from './retrieved-epc-grid.component';

describe('RetrievedEpcGridComponent', () => {
  let component: RetrievedEpcGridComponent;
  let fixture: ComponentFixture<RetrievedEpcGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrievedEpcGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrievedEpcGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
