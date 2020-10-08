import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SubSink } from 'subsink';
import { HnsResultsService, AlertService } from 'src/app/_services';

@Component({
  selector: 'app-hns-res-edit-asset-text',
  templateUrl: './hns-res-edit-asset-text.component.html',
  styleUrls: ['./hns-res-edit-asset-text.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsResEditAssetTextComponent implements OnInit {
  @Input() showEditAssetText: boolean = false;
  @Output() closeEditAssetText = new EventEmitter<boolean>();
  @Input() selectedAction: any;
  title: any = "Asset Text...";
  subs = new SubSink();
  assetUpdatedData: any
  assetText: any;
  currentUser: any;


  constructor(
    private hnsResultService: HnsResultsService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getAssetText(this.selectedAction.assid)
  }


  closeEditAssetTextMethod() {
    this.showEditAssetText = false;
    this.closeEditAssetText.emit(this.showEditAssetText);
  }

  getAssetText(assid) {
    this.subs.add(
      this.hnsResultService.getAssetText(assid).subscribe(
        data => {
          if (data.isSuccess && data.data.length > 0) {
            this.assetUpdatedData = data.data[0];
            this.assetText = data.data[0].text;
            this.chRef.detectChanges();
          }
        }
      )
    )
  }


  saveAssetText() {
    this.subs.add(
      this.hnsResultService.updateAssetText(this.selectedAction.assid, this.assetText, this.currentUser.userId).subscribe(
        data => {
          console.log(data)
          if (data.isSuccess) {
            this.alertService.success("Asset text updated successfully.");
            this.closeEditAssetTextMethod()
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

}
