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
        filedata => {
          let fileExt = "pdf";
          this.assetAttributeService.getMimeType(fileExt).subscribe(
            mimedata => {
              if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                  if (mimedata.data.openWindow)
                  {
                    var byteCharacters = atob(filedata);
                    var byteNumbers = new Array(byteCharacters.length);
                    for (var i = 0; i < byteCharacters.length; i++) {
                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                    var fileURL = URL.createObjectURL(file);
                    let newPdfWindow =window.open(fileURL);
                  }
                  else
                  {
                    linkSource = linkSource + filedata;
                    const downloadLink = document.createElement("a");
                    const fileName = 'Report';
                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();
                  }

                }
                else{
                  this.alertService.error("This file format is not supported.");
                }
            }
          )
        },
        error => {
          this.alertService.error(error);
        }
      )
    )
  }

}
