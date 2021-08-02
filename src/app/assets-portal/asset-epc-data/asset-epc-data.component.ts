import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AssetAttributeService, HelperService, AlertService, SharedService } from '../../_services'
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';

@Component({
  selector: 'app-asset-epc-data',
  templateUrl: './asset-epc-data.component.html',
  styleUrls: ['./asset-epc-data.component.css']
})
export class AssetEpcDataComponent implements OnInit {
  @Input() dataWindow: boolean = false;
  @Input() assetId: string;
  @Input() epcSequence: string;
  @Input() address: string;
  @Input() rrn: string;
  @Output() closeDataWindow = new EventEmitter<boolean>();
  energyPortalAccess = [];
  state: State = {
    skip: 0,
    sort: [{ field: 'edcname', dir: 'asc' }],
    group: [{
      field: 'edcname',
    }],
    filter: {
      logic: "and",
      filters: []
    }
  }

  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  public gridView: DataResult;
  public energyData;
  public allowUnsort = true;
  public multiple = false;

  subs = new SubSink(); // to unsubscribe services
  disclosure;
  loadData = false;

  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.getLatestRDSAPAnswers();
    this.sharedService.energyPortalAccess.subscribe(data => {
      this.energyPortalAccess = data;
    });
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public closeDataWin() {
    this.dataWindow = false;
    this.closeDataWindow.emit(this.dataWindow)
  }


 getLatestRDSAPAnswers() {
    this.subs.add(
      this.assetAttributeService.getEPCData(this.assetId, this.epcSequence).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.energyData = data.data;
            let gd = process(this.energyData, this.state);
            this.gridView = gd;
            let tempData: any = gd;
            this.loadData = true;
            //const tempd = data.data;
            // tempd.sort(function (a, b) {
            //   return a["edcsequence"] - b["edcsequence"] || a["edqsequence"] - b["edqsequence"];
            // });
            /* uncomment this */
            let groupingKey: any[] = [];
            this.energyData.forEach(element => {
              if (!groupingKey.includes(element.edcname)) {
                groupingKey.push(element.edcname);
              }
            });

            let afterGrouping = groupingKey.map((v, k) => {
              let cell = tempData.data.filter((val, key) => {
                if (val.value == v) {
                  return val;
                }
              })
              return cell[0];
            })
            this.gridView.data = afterGrouping;

          }

        }
      )
    )
  }



  getYear(initialDate){
    var properDate = new Date(initialDate);
    var yearValue = properDate.getFullYear();
    return yearValue;
    }


    exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
        //let ignore = ['assid','edeid','answerOnly','asctext','ascvalue','assid','ataid','chacode','eaarepairyear','eaascenarioanswercost','edccode','edcname','edcsequence','edeid','edqdatause','edqsequence','edqtype','enadate','enadescription','enasource','enatime','enauser','enscode','sapcode'];
        let ignore = [];
        let label = {
          'edcname': 'Category',
          'edqtext': 'Energy Survey Question',
          'answerOnly': 'Answer',
          'enadate': 'Date',
          'enatime': 'Time',
          'enauser': 'User'
        }
        let tempData = this.energyData;

        tempData.map(s => {
          s.enadate = (s.enadate != "") ? ((this.getYear(s.enadate) > 1900) ? s.enadate : "")  : "";
          s.enatime = (s.enatime != "") ? ((s.enatime != '00:00:00') ? s.enatime : "")  : "";
        });


        if (rowSelection != null) {
          if (this.mySelection.length != undefined && this.mySelection.length > 0) {
            let selectedRows = tempData.filter((v, k) => {
              return this.mySelection.includes(k)
            });
            this.selectedRows = selectedRows;
          } else {
            this.selectedRows = tempData;
          }
        } else {
          this.selectedRows = tempData;
        }

        if (this.selectedRows && this.selectedRows.length > 0) {
          this.helper.exportToexcelWithAssetDetails(this.selectedRows, this.assetId + '_EPC_Data', label)
        } else {
          this.alertService.error("There are no records to export.")
        }

    }

    checkEnergyPortalAccess(val: string): Boolean {
      if (this.energyPortalAccess != undefined) {
      return this.energyPortalAccess.includes(val);
      }
    }

    getEPCComponentsReport() {
      this.assetAttributeService.getEPCComponentsReport(this.assetId, this.epcSequence).subscribe(
        filedata => {
          let fileExt = "pdf";
          this.assetAttributeService.getMimeType(fileExt).subscribe(
            mimedata => {
              if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                  if (mimedata.data.openWindow)
                  {
                    var byteCharacters = atob(filedata.data);
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
                    linkSource = linkSource + filedata.data;
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
    }

}
