import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AssetAttributeService, HelperService, AlertService, SharedService } from '../../_services'
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';

@Component({
  selector: 'app-asset-epc-history',
  templateUrl: './asset-epc-history.component.html',
  styleUrls: ['./asset-epc-history.component.css'],
})
export class AssetEpcHistoryComponent implements OnInit {
  @Input() historyWindow: boolean = false;
  @Input() assetId: string;
  @Input() epcSequence: string;
  @Input() address: string;
  @Input() rrn: string;
  @Output() closehistoryWindow = new EventEmitter<boolean>();
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  energyPortalAccess = [];
  subs = new SubSink(); // to unsubscribe services
  energyTableData;

  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.getAssetEPCHistoryList();
    this.sharedService.energyPortalAccess.subscribe(data => { 
      this.energyPortalAccess = data;
    });
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public closeHistoryWin() {
    this.historyWindow = false;
    this.closehistoryWindow.emit(this.historyWindow)
  }


  getAssetEPCHistoryList() {
    this.subs.add(
      this.assetAttributeService.getAssetEPCHistoryList(this.assetId, this.epcSequence).subscribe(
        data => {

          if (data && data.isSuccess) {
            this.energyTableData = data.data;
                   
          }
          
        }
      ))
  }


  
  getYear(initialDate){
    var properDate = new Date(initialDate);
    var yearValue = properDate.getFullYear();
    return yearValue;
    }


    exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
      if (this.energyTableData && this.energyTableData.length > 0) {
        let tempData = this.energyTableData;
        //let ignore = ['assid','edeid','answerOnly','asctext','ascvalue','assid','ataid','chacode','eaarepairyear','eaascenarioanswercost','edccode','edcname','edcsequence','edeid','edqdatause','edqsequence','edqtype','enadate','enadescription','enasource','enatime','enauser','enscode','sapcode'];
        let ignore = [];
        let label = {
          'm_USERNAME':'User',
          'process': 'Process',
          'result': 'Result',
          'logDate': 'Date',
          'logTime':'Time',
        }

        tempData.map(s => {
          s.logDate = (s.logDate != "") ? DateFormatPipe.prototype.transform(s.logDate, 'DD-MMM-YYYY') : s.logDate;
          s.logTime = (s.logTime != "") ? DateFormatPipe.prototype.transform(s.logTime, 'hh:mm:ss') : s.logTime;
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


        this.helper.exportToexcelWithAssetDetails(this.selectedRows, this.assetId + '_EPC_History', label)

      } else {
        this.alertService.error("There are no records to export.")
      }

    }

    checkEnergyPortalAccess(val: string): Boolean {
      if (this.energyPortalAccess != undefined) {
      return this.energyPortalAccess.includes(val);
      }
    }
    
}
