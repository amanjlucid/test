import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService, WorksOrdersService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-swap-package',
  templateUrl: './swap-package.component.html',
  styleUrls: ['./swap-package.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SwapPackageComponent implements OnInit {
  @Input() packageToWorklistWindow: boolean = false;
  // @Input() selectedItem: any;
  @Output() closePackageWindowEvent = new EventEmitter<boolean>();
  @Input() selectedItem: any;
  // @Input() addWorkorderType: any;

  subs = new SubSink();
  state: State = {
    skip: 0,
    take: 25,
    sort: [],
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  packageData: any;
  gridView: DataResult;
  gridLoading = true
  pageSize = 25;
  title = 'Add Package To Work List';
  worksOrder: any;
  planYear: any;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  packageQuantityWindow = false;
  assetDetail:any;

  @ViewChild(GridComponent) grid: GridComponent;

  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }


  ngOnInit(): void {
    // console.log(this.selectedItem)
    // console.log(this.actualSelectedRow)
    // console.log(this.addWorkorderType)

    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorksOrderByWOsequence(this.selectedItem.wosequence),
        this.worksorderManagementService.getPlanYear(this.selectedItem.wosequence),
        this.worksorderManagementService.getAssetAddressForSpecificAsset(this.selectedItem.wosequence, this.selectedItem.wopsequence, this.selectedItem.assid, this.selectedItem.wochecksurcde)
      ]).subscribe(
        data => {
          // console.log(data);
          this.worksOrder = data[0].data;
          this.planYear = data[1].data;
          this.assetDetail = data[2].data;
          this.getPackageList();

        }
      ))
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getPackageList() {
    const params = {
      ASSID: this.selectedItem.assid,
      CTTSURCDE: this.worksOrder.cttsurcde,
      WOSEQUENCE: this.selectedItem.wosequence,
      PlANYEAR: this.planYear,
      WOCHECKSURCDE: this.selectedItem?.wochecksurcde,
      WLATAID: this.selectedItem?.wlataid,
    }

    this.subs.add(
      this.worksorderManagementService.getWorksPackagesForAssets(params).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            this.packageData = data.data;
            this.gridView = process(this.packageData, this.state);
            this.gridLoading = false;
            setTimeout(() => {
              this.grid.autoFitColumns();
            }, 100);
          } else {
            this.alertService.error(data.message);
          }
          this.chRef.detectChanges();
        },
        err => this.alertService.error(err)
      )
    )
  }

  closePackageWindow() {
    this.packageToWorklistWindow = false;
    this.closePackageWindowEvent.emit(this.packageToWorklistWindow);
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.packageData, this.state);
    this.chRef.detectChanges();
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.packageData, this.state);
    this.chRef.detectChanges();
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.packageData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.packageData.length
    };
    this.chRef.detectChanges();
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.selectedDefinition = dataItem;
    // if (columnIndex > 1) {
    //   this.openDefinitionDetailPopUp(dataItem)
    // }
  }

  // mySelectionKey(context: RowArgs): string {
  //   return encodeURIComponent(context.dataItem.wphcode);
  // }

  selectionChange(item) {
    if (this.mySelection.includes(item.wphcode)) {
      this.mySelection = this.mySelection.filter(x => x != item.wphcode);
    } else {
      this.mySelection.push(item.wphcode);
    }

    this.chRef.detectChanges();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'multiple'
    };
  }

  addTickedToWorklist() {
    this.packageQuantityWindow = true;
    $('.worklistPackageOvrlay').addClass('ovrlay');
  }

  closePackageQuantiyEvent(eve) {
    this.packageQuantityWindow = eve;
    $('.worklistPackageOvrlay').removeClass('ovrlay');
    if(eve){
      this.closePackageWindow()
    }
  }

  refreshPackageList(eve) {
    // this.mySelection = [];
    this.getPackageList();
    this.chRef.detectChanges();
  }

  checkPackageExist(item) {
    if (item.attributeexists == 'Work Package Exists') return false;
    if (item.exclusionreason == 'Work Package already exists on Work List') return false;
    return true;
  }


}
