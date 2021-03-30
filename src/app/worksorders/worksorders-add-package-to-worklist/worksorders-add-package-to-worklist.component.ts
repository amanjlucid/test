import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-worksorders-add-package-to-worklist',
  templateUrl: './worksorders-add-package-to-worklist.component.html',
  styleUrls: ['./worksorders-add-package-to-worklist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WorksordersAddPackageToWorklistComponent implements OnInit {
  @Input() packageToWorklistWindow: boolean = false;
  @Input() selectedWorkOrder: any;
  @Output() closePackageWindowEvent = new EventEmitter<boolean>();

  subs = new SubSink();
  state: State = {
    skip: 0,
    take: 25,
    sort: [],
    group: [],
    filter: {
      logic: "or",
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

  constructor(
    private chRef: ChangeDetectorRef,
    private worksorderManagementService: WorksorderManagementService,
    private alertService: AlertService
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {

    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorksOrderByWOsequence(this.selectedWorkOrder.wosequence),
        this.worksorderManagementService.getPlanYear(this.selectedWorkOrder.wosequence)
      ]).subscribe(
        data => {
          this.worksOrder = data[0].data;
          this.planYear = data[1].data;
          this.getPackageList();
          // console.log(data);
        }
      ))
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getPackageList() {
    const params = {
      ASSID: this.selectedWorkOrder.assid,
      CTTSURCDE: this.worksOrder.cttsurcde,
      WOSEQUENCE: this.selectedWorkOrder.wosequence,
      PlANYEAR: this.planYear,
      WOCHECKSURCDE: 0,
      WLATAID: 0,
    }
    this.subs.add(
      this.worksorderManagementService.getWorksPackagesForAssets(params).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            this.packageData = data.data;
            this.gridView = process(this.packageData, this.state);
            this.gridLoading = false;
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
  }

}
