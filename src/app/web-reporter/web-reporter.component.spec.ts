import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebReporterComponent } from './web-reporter.component';

describe('WebReporterComponent', () => {
  let component: WebReporterComponent;
  let fixture: ComponentFixture<WebReporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebReporterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebReporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
