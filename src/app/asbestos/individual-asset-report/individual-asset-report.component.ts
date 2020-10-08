import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssetAttributeService, AlertService, SharedService } from 'src/app/_services';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-individual-asset-report',
  templateUrl: './individual-asset-report.component.html',
  styleUrls: ['./individual-asset-report.component.css']
})
export class IndividualAssetReportComponent implements OnInit, OnDestroy {
  selectedAsset: any;
  subs = new SubSink();


  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.subs.add(
      this.sharedService.sharedAsset.subscribe(data => { this.selectedAsset = data })
    )

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  generateReport() {
    this.subs.add(
      this.assetAttributeService.individualAssetReport(this.selectedAsset.assetId).subscribe(
        data => {
          const linkSource = 'data:application/pdf;base64,' + data;
          const downloadLink = document.createElement("a");
          const fileName = 'Report';
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        },
        error => {
          this.alertService.error(error);
        }
      )
    )
  }

}
