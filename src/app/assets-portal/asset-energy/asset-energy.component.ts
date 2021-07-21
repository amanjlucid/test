import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { AssetAttributeService, HelperService } from '../../_services'
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-asset-energy',
  templateUrl: './asset-energy.component.html',
  styleUrls: ['./asset-energy.component.css']
})
export class AssetEnergyComponent implements OnInit, OnDestroy {

  @Input() assetId: string;
  @Input() selectedAsset;

  state: State = {
    skip: 0,
    sort: [{ field: 'edcname', dir: 'asc' }],
    group: [{
      field: 'edcname',
    }],
    filter: {
      logic: "or",
      filters: []
    }
  }
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  public allowUnsort = true;
  public multiple = false;
  public energyData;
  public gridView: DataResult;
  loadData = false;
  isEdcname = false;
  energyTableData;
  fileName: string = 'energy-answer.xlsx';
  fileNameTop: string = 'energy-rating.xlsx';
  subs = new SubSink(); // to unsubscribe services

  constructor(
    private assetAttributeService: AssetAttributeService,
    private helper: HelperService,
  ) { }

  ngOnDestroy() {
    console.log('leave')
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.getLatestRDSAPExtractAssetDetail();

  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }
  // public sortChange(sort: SortDescriptor[]): void {
  //   this.state.sort = sort;
  //   this.gridView = process(this.energyData, this.state);
  // }

  // public filterChange(filter: CompositeFilterDescriptor): void {
  //   this.state.filter = filter;
  //   this.gridView = process(this.energyData, this.state);

  // }

  getLatestRDSAPAnswers() {
    this.subs.add(
      this.assetAttributeService.getLatestRDSAPAnswers(this.assetId).subscribe(
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

  getLatestRDSAPExtractAssetDetail() {
    this.subs.add(
      this.assetAttributeService.getLatestRDSAPExtractAssetDetail(this.assetId).subscribe(
        data => {

          this.getLatestRDSAPAnswers();
          if (data && data.isSuccess) {
            this.energyTableData = data.data;
          }
        }
      ))
  }


  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
      this.fileName = 'energy-answer.' + fileExt;
      //let ignore = ['assid','edeid','answerOnly','asctext','ascvalue','assid','ataid','chacode','eaarepairyear','eaascenarioanswercost','edccode','edcname','edcsequence','edeid','edqdatause','edqsequence','edqtype','enadate','enadescription','enasource','enatime','enauser','enscode','sapcode'];
      let ignore = [];
      let label = {
        'edqtext': 'Energy Field',
        'rdsapStatus': 'Mapping',
        'answer': 'Value'
      }
      let groupData = this.gridView.data.map(x => {
        return x.items;
      });
      let energyGrpData = [].concat.apply([], groupData);

      if (rowSelection != null) {
        if (this.mySelection.length != undefined && this.mySelection.length > 0) {
          let selectedRows = energyGrpData.filter((v, k) => {
            return this.mySelection.includes(k)
          });
          this.selectedRows = selectedRows;
        } else {
          this.selectedRows = energyGrpData;
        }
      } else {
        this.selectedRows = energyGrpData;
      }

      // if (fileExt == 'xlsx' && rowSelection != null) {
      if (fileExt == 'xlsx') {
        //this.helper.exportAsExcelFile(this.selectedRows, 'energy-answer', label)
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, 'energy-answer', label)
      } else if (fileExt == 'html') {
        this.helper.exportAsHtmlFile(this.selectedRows, this.fileName, label)
      } else {
        this.helper.exportToCsv(this.fileName, this.selectedRows, ignore, label);
      }

    } else {
      grid.saveAsExcel();
    }

  }

  exportToExcelTop(grid: GridComponent, fileExt): void {
    if (this.energyTableData.length != undefined && this.energyTableData.length > 0) {
      if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx') {
        this.fileName = 'energy-rating.' + fileExt;
        let ignore = [];
        let label = {
          'eeaextractlevel': 'Rating Status',
          'analysis_Date': 'Analysis Date',
          'sprsap': 'SAP',
          'sprsapband': 'SAP Band',
          'sprei': 'EI',
          'spreiband': 'EI Band',
          'sprcO2': 'CO2',
          'sprenergyuse': 'Energy Use',
          'sprlightcost': 'Lighting £',
          'sprspaceheat': 'Space Heating £',
          'sprwaterheat': 'Water Heating £',
          'sprsecspaceheat': 'Secondary Heating £',
          'sprspacecool': 'Space Cooling Costs',
          'sprpumpsfans': 'Pump/Fans £',
          'sprtotalcost': 'Total £'
        }
        // let groupData = this.gridView.data.map(x => {
        //   return x.items;
        // })
        // let energyGrpData = [].concat.apply([],groupData);
        
        
        // if (fileExt == 'html') {
        //   this.helper.exportAsHtmlFile(this.energyTableData, this.fileName, label)
        // } else {
        //   this.helper.exportToCsv(this.fileName, this.energyTableData, ignore, label);
        // }
        this.helper.exportToexcelWithAssetDetails(this.energyTableData, 'energy-rating', label)

      } else {
        grid.saveAsExcel();
      }
    } else {
      alert('There is no record to import');
    }

  }




}
