import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetHSAssessentsComponent } from './asset-hs-assessents.component';

describe('AssetHSAssessentsComponent', () => {
  let component: AssetHSAssessentsComponent;
  let fixture: ComponentFixture<AssetHSAssessentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetHSAssessentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetHSAssessentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
