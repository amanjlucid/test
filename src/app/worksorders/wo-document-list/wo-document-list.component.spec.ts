import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoDocumentListComponent } from './wo-document-list.component';

describe('WoDocumentListComponent', () => {
  let component: WoDocumentListComponent;
  let fixture: ComponentFixture<WoDocumentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoDocumentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
