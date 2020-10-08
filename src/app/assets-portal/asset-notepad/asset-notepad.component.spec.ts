import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetNotepadComponent } from './asset-notepad.component';

describe('AssetNotepadComponent', () => {
  let component: AssetNotepadComponent;
  let fixture: ComponentFixture<AssetNotepadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetNotepadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetNotepadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
