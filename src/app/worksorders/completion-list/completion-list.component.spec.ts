import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletionListComponent } from './completion-list.component';

describe('CompletionListComponent', () => {
  let component: CompletionListComponent;
  let fixture: ComponentFixture<CompletionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompletionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
