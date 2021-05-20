import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoPmInstructionAssetsDetailComponent } from './wo-pm-instruction-assets-detail.component';

describe('WoPmInstructionAssetsComponent', () => {
  let component: WoPmInstructionAssetsDetailComponent;
  let fixture: ComponentFixture<WoPmInstructionAssetsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoPmInstructionAssetsDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WoPmInstructionAssetsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
