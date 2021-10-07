import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-group-asset-detail',
  templateUrl: './group-asset-detail.component.html',
  styleUrls: ['./group-asset-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class GroupAssetDetailComponent implements OnInit {
  subs = new SubSink();
  @Input() showAssetDetail = false;
  @Input() selectedGroup;
  @Output() closeAssetDetailEvent = new EventEmitter<boolean>();
  title = `Asset Details`;
  tabName = 'settings';

  constructor(
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.title = `Asset Details - ${this.selectedGroup?.group}`;
    this.chRef.detectChanges()
  }

  showTab(tabName) {
    this.tabName = tabName;
  }

  closeAssetDetail() {
    this.showAssetDetail = false;
    this.closeAssetDetailEvent.emit(false);
  }

  closeGroupAssetDetail(event){
    this.closeAssetDetail()
  }

}
