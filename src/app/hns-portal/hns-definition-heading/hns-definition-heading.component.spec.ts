import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HnsDefinitionHeadingComponent } from './hns-definition-heading.component';

describe('HnsDefinitionHeadingComponent', () => {
  let component: HnsDefinitionHeadingComponent;
  let fixture: ComponentFixture<HnsDefinitionHeadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HnsDefinitionHeadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HnsDefinitionHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
