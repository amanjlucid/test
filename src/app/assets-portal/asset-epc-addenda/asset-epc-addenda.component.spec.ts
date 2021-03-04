import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEpcAddendaComponent } from './asset-epc-addenda.component';

describe('AssetEpcAddendaComponent', () => {
  let component: AssetEpcAddendaComponent;
  let fixture: ComponentFixture<AssetEpcAddendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetEpcAddendaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetEpcAddendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
