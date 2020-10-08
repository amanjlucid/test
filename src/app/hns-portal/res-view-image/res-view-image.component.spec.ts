import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResViewImageComponent } from './res-view-image.component';

describe('ResViewImageComponent', () => {
  let component: ResViewImageComponent;
  let fixture: ComponentFixture<ResViewImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResViewImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResViewImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
