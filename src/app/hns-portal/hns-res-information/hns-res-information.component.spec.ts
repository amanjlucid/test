import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsResInformationComponent } from './hns-res-information.component';

describe('HnsResInformationComponent', () => {
  let component: HnsResInformationComponent;
  let fixture: ComponentFixture<HnsResInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsResInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsResInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
