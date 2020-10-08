import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsDefinitionDetailComponent } from './hns-definition-detail.component';

describe('HnsDefinitionDetailComponent', () => {
  let component: HnsDefinitionDetailComponent;
  let fixture: ComponentFixture<HnsDefinitionDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsDefinitionDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsDefinitionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
