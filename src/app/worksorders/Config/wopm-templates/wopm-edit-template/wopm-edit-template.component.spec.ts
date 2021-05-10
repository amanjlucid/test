import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WopmEditTemplateComponent } from './wopm-edit-template.component';

describe('WopmEditTemplateComponent', () => {
  let component: WopmEditTemplateComponent;
  let fixture: ComponentFixture<WopmEditTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WopmEditTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WopmEditTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
