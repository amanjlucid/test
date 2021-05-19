import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, WorksorderManagementService } from 'src/app/_services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-variation-additional-work-item',
  templateUrl: './variation-additional-work-item.component.html',
  styleUrls: ['./variation-additional-work-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class VariationAdditionalWorkItemComponent implements OnInit {
  @Input() openadditionalWork: boolean = false;
  @Input() openedFrom = 'assetchecklist';
  @Input() openedFor = 'details';
  @Input() singleVariation: any;
  @Output() closeAdditionalWorkEvent = new EventEmitter<boolean>();
  title = 'Choose Work Packages';
  subs = new SubSink();
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  additionalWorkData: any;
  gridView: DataResult;
  loading = true;
  pageSize = 25;
  selectableSettings: SelectableSettings;
  mySelection: any[] = [];
  packageQuantityWindow = false;
  worksOrderData:any;

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    console.log(this.singleVariation);
    this.requiredPagedata();
  }


  requiredPagedata() {
    const { wosequence, assid, wopsequence } = this.singleVariation;
    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        // this.workOrderProgrammeService.specificWorkOrderAssets(wosequence, assid, wopsequence),
        this.workOrderProgrammeService.getPlanYear(wosequence)
      ]).subscribe(
        data => {
          console.log(data)
          this.worksOrderData = data[0].data;
          // const assetData = data[1].data[0];
          const planYear = data[1].data;

          const { wosequence, woisequence, cttsurcde, assid } = this.singleVariation;

          const params = {
            ASSID: assid,
            CTTSURCDE: cttsurcde,
            PLANYEAR: planYear,
            WOSEQUENCE: wosequence,
            WOCHECKSURCDE: 0,
            WOISEQUENCE: woisequence
          }

          this.getWorkPacakgeData(params);



        }, err => this.alertService.error(err)
      )
    )
  }


  getWorkPacakgeData(params) {
    this.subs.add(
      this.workOrderProgrammeService.getWorkPackagesForAssetVariation(params).subscribe(
        data => {
          console.log(data)
          if (data.isSuccess) {
            this.additionalWorkData = data.data;
            this.gridView = process(this.additionalWorkData, this.state);
          } else this.alertService.error(data.message);

          this.loading = false;
          this.chRef.detectChanges();
        }
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeAdditionalWork() {
    this.openadditionalWork = false;
    this.closeAdditionalWorkEvent.emit(false);
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'multiple'
    };
  }

  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.additionalWorkData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.additionalWorkData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.additionalWorkData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.additionalWorkData.length
    };
  }

  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    // this.selectedSingleVarWorkList = dataItem;
  }

  selectionChange(item) {
    if (this.mySelection.includes(item.wphcode)) {
      this.mySelection = this.mySelection.filter(x => x != item.wphcode);
    } else {
      this.mySelection.push(item.wphcode);
    }

    this.chRef.detectChanges();
  }


  checkPackageExist(item) {
    if (item.attributeexists == 'Variation Exists' || item.attributeexists == 'Work Package Exists') return false;
    if (item.exclusionreason == 'Work Package already exists on Work List' || item.exclusionreason == 'Work Package already exists as Variation') return false;
    return true;
  }

  addTickedToVariation() {
    this.packageQuantityWindow = true;
    $('.worklistPackageOvrlay').addClass('ovrlay');
  }

  closePackageQuantiyEvent(eve) {
    this.packageQuantityWindow = eve;
    $('.worklistPackageOvrlay').removeClass('ovrlay');
  }

  refreshPackageList(eve) {
    // this.mySelection = [];
    this.requiredPagedata();
    this.chRef.detectChanges();
  }

}
