import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementsGroupComponent } from './elements-group.component';

describe('ElementsGroupComponent', () => {
  let component: ElementsGroupComponent;
  let fixture: ComponentFixture<ElementsGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementsGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
