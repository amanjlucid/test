import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResAnsImageComponent } from './hns-res-ans-image.component';

describe('HnsResAnsImageComponent', () => {
  let component: HnsResAnsImageComponent;
  let fixture: ComponentFixture<HnsResAnsImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResAnsImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResAnsImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
