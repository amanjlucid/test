import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAssetDetailComponent } from './group-asset-detail.component';

describe('GroupAssetDetailComponent', () => {
  let component: GroupAssetDetailComponent;
  let fixture: ComponentFixture<GroupAssetDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupAssetDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAssetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
