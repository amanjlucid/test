import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AssetAttributeService, HelperService, AlertService, SharedService } from '../../_services'
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';

@Component({
  selector: 'app-asset-epc-recommendations',
  templateUrl: './asset-epc-recommendations.component.html',
  styleUrls: ['./asset-epc-recommendations.component.css']
})
export class AssetEpcRecommendationsComponent implements OnInit {
  @Input() recWindow: boolean = false;
  @Input() assetId: string;
  @Input() epcSequence: string;
  @Input() address: string;
  @Input() rrn: string;
  @Output() closerecWindow = new EventEmitter<boolean>();
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  public showOld: boolean = false;
  public showNew: boolean = false;
  energyPortalAccess = [];

  subs = new SubSink(); // to unsubscribe services
  newrecommendationsTableData;
  oldrecommendationsTableData;
  epcRecommendationsType;

  constructor(
    private assetAttributeService: AssetAttributeService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.getAssetEPCRecommendationsList();
    this.sharedService.energyPortalAccess.subscribe(data => { 
      this.energyPortalAccess = data;
    });
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public closeRecWin() {
    this.recWindow = false;
    this.closerecWindow.emit(this.recWindow)
  }


  getAssetEPCRecommendationsList() {
    this.subs.add(
      this.assetAttributeService.isNewRecommendationsFormat(this.assetId, this.epcSequence).subscribe(
        data => {

          if (data && data.isSuccess) {
            this.epcRecommendationsType = data.data;
            if (this.epcRecommendationsType.anyRecords)
            {
              if (this.epcRecommendationsType.newType)
              {
                
                this.subs.add(
                  this.assetAttributeService.getNewRecommendations(this.assetId, this.epcSequence).subscribe(
                    data => {
                      if (data && data.isSuccess) {
                        this.newrecommendationsTableData = data.data;
                        this.newrecommendationsTableData.map(s => {
                          s.moneySaved = (s.moneySaved != "") ? '£' + s.moneySaved : s.moneySaved;
                        });
                        this.showNew = true;
                      }

                    }
                  )
            
                )
              }
              else
              {
                
                this.subs.add(
                  this.assetAttributeService.getOldRecommendations(this.assetId, this.epcSequence).subscribe(
                    data => {
                      if (data && data.isSuccess) {
                        this.oldrecommendationsTableData = data.data;
                        this.oldrecommendationsTableData.map(s => {
                          s.moneySaved = (s.moneySaved != "") ? '£' + s.moneySaved : s.moneySaved;
                        });
                        this.showOld = true;
                      }
                    }
                  )
            
                )
              }

            }
            else
            {
              this.showNew = true;
            }
          }
          
        }
      ))
  }


  
  getYear(initialDate){
    var properDate = new Date(initialDate);
    var yearValue = properDate.getFullYear();
    return yearValue;
    }


    exportNewToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
      if (this.newrecommendationsTableData && this.newrecommendationsTableData.length > 0) {
        let tempData = this.newrecommendationsTableData;
        //let ignore = ['assid','edeid','answerOnly','asctext','ascvalue','assid','ataid','chacode','eaarepairyear','eaascenarioanswercost','edccode','edcname','edcsequence','edeid','edqdatause','edqsequence','edqtype','enadate','enadescription','enasource','enatime','enauser','enscode','sapcode'];
        let ignore = [];
        let label = {
          'improveTo':'Improvement',
          'improvedSAP': 'SAP',
          'improvedEI': 'EI',
          'moneySaved': 'Saving',
          'indicativeCost': 'Indicative Cost',
          'greenDeal': 'Green Deal',
          'reasonRemovedNote': 'Reason Removed',
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

        this.helper.exportToexcelWithAssetDetails(this.selectedRows, this.assetId + '_EPC_Recommendations', label)

      } else {
        this.alertService.error("There are no records to export.")
      }

    }


    exportOldToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
      if (this.oldrecommendationsTableData && this.oldrecommendationsTableData.length > 0) {
        let tempData = this.oldrecommendationsTableData;
        //let ignore = ['assid','edeid','answerOnly','asctext','ascvalue','assid','ataid','chacode','eaarepairyear','eaascenarioanswercost','edccode','edcname','edcsequence','edeid','edqdatause','edqsequence','edqtype','enadate','enadescription','enasource','enatime','enauser','enscode','sapcode'];
        let ignore = [];
        let label = {
          'improveTo': 'Improvement',
          'resultingSAP': 'SAP',
          'resultingEI': 'EI',
          'moneySaved': 'Saving',
          'cO2Saved': 'CO2 Saved',
          'costBracketName': 'Cost Bracket',
          'reasonRemovedNote': 'Reason Removed',
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
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, this.assetId + '_EPC_Recommendations', label)
      } else {
        this.alertService.error("There is no record to export.")
      }

    }



    checkEnergyPortalAccess(val: string): Boolean {
      if (this.energyPortalAccess != undefined) {
      return this.energyPortalAccess.includes(val);
      }
    }


}
