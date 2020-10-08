import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsProbabilityListComponent } from './hns-probability-list.component';

describe('HnsProbabilityListComponent', () => {
  let component: HnsProbabilityListComponent;
  let fixture: ComponentFixture<HnsProbabilityListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsProbabilityListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsProbabilityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
