import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AssetAttributeService, HelperService, AlertService, SharedService } from '../../_services'
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';

@Component({
  selector: 'app-asset-epc-addenda',
  templateUrl: './asset-epc-addenda.component.html',
  styleUrls: ['./asset-epc-addenda.component.css']
})
export class AssetEpcAddendaComponent implements OnInit {
  @Input() addendaWindow: boolean = false;
  @Input() assetId: string;
  @Input() epcSequence: string;
  @Input() address: string;
  @Input() rrn: string;
  @Output() closeAddendaWindow = new EventEmitter<boolean>();
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  energyPortalAccess = [];

  subs = new SubSink(); // to unsubscribe services
  addendaTableData;
  disclosure;

  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.getAssetEPCAddenda();
    this.sharedService.energyPortalAccess.subscribe(data => { 
      this.energyPortalAccess = data;
    });
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public closeAddendaWin() {
    this.addendaWindow = false;
    this.closeAddendaWindow.emit(this.addendaWindow)
  }


  getAssetEPCAddenda() {
    this.subs.add(
      this.assetAttributeService.getAddendaDisclosure(this.assetId, this.epcSequence).subscribe(
        data => {

          if (data && data.isSuccess) {
            this.addendaTableData = data.data.addenda;
            this.disclosure = data.data.disclosure;
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
      if (this.addendaTableData && this.addendaTableData.length > 0) {
        let tempData = this.addendaTableData;
        //let ignore = ['assid','edeid','answerOnly','asctext','ascvalue','assid','ataid','chacode','eaarepairyear','eaascenarioanswercost','edccode','edcname','edcsequence','edeid','edqdatause','edqsequence','edqtype','enadate','enadescription','enasource','enatime','enauser','enscode','sapcode'];
        let ignore = [];
        let label = {
          'circumstances':'Addenda',
          'description': 'Description',
        }

  
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


        this.helper.exportToexcelWithAssetDetails(this.selectedRows, this.assetId + '_EPC_Addenda', label)

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
