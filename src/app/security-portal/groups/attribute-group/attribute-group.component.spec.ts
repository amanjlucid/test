import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeGroupComponent } from './attribute-group.component';

describe('AttributeGroupComponent', () => {
  let component: AttributeGroupComponent;
  let fixture: ComponentFixture<AttributeGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
