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
  @Input() selectedVariationInp: any;
  @Input() selectedSingleVariationAssetInp: any;
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
  worksOrderData: any;
  selectedPackagesArr: any = [];;

  // @Input() singleVariation: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
  ) {
    this.setSelectableSettings();
  }

  ngOnInit(): void {
    // console.log({ openfor: this.openedFor, from: this.openedFrom, variation: this.selectedVariationInp, asset: this.selectedSingleVariationAssetInp })

    this.requiredPagedata();
  }


  requiredPagedata() {
    const { wosequence } = this.selectedSingleVariationAssetInp;

    this.subs.add(
      forkJoin([
        this.workOrderProgrammeService.getWorksOrderByWOsequence(wosequence),
        this.workOrderProgrammeService.getPlanYear(wosequence)
      ]).subscribe(
        data => {
          // console.log(data)
          this.worksOrderData = data[0].data;
          const planYear = data[1].data;

          let params: any;

          if (this.openedFrom == "worksorder") {
            const { cttsurcde } = this.selectedVariationInp;
            const { assid, wosequence, woisequence } = this.selectedSingleVariationAssetInp;
            params = {
              ASSID: assid,
              CTTSURCDE: cttsurcde,
              PLANYEAR: planYear,
              WOSEQUENCE: wosequence,
              WOCHECKSURCDE: 0,
              WOISEQUENCE: woisequence
            }

          } else if (this.openedFrom == "assetchecklist") {
            const { wosequence, woisequence, cttsurcde, assid } = this.selectedSingleVariationAssetInp;
            params = {
              ASSID: assid,
              CTTSURCDE: cttsurcde,
              PLANYEAR: planYear,
              WOSEQUENCE: wosequence,
              WOCHECKSURCDE: 0,
              WOISEQUENCE: woisequence
            }
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
          // console.log(data)
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
    const findRow = this.selectedPackagesArr.find(x => JSON.stringify(x) == JSON.stringify(item));
    
    if (findRow) {
      this.selectedPackagesArr = this.selectedPackagesArr.filter(x => JSON.stringify(x) != JSON.stringify(item))
      this.mySelection = this.selectedPackagesArr.map(x => x.wphcode);
    } else {
      this.selectedPackagesArr.push(item);
      this.mySelection.push(item.wphcode);
    }


    this.chRef.detectChanges();
  }


  checkPackageExist(item) {
    if (item.attributeexists == 'Variation Exists'||item.attributeexists == 'Attribute exists' || item.attributeexists == 'Work Package Exists') return false;

    if (item.exclusionreason == 'Work Package already exists on Work List'|| item.exclusionreason == 'Attribute already exists on Work List' || item.exclusionreason == 'Work Package already exists as Variation') return false;
    
    return true;
  }

  addTickedToVariation() {
    this.packageQuantityWindow = true;
    $('.worklistPackageOvrlay').addClass('ovrlay');
  }

  closePackageQuantiyEvent(eve) {
    this.packageQuantityWindow = eve;
    $('.worklistPackageOvrlay').removeClass('ovrlay');
    this.requiredPagedata();
  }

  refreshPackageList(eve) {
    // this.mySelection = [];
    this.requiredPagedata();
    this.chRef.detectChanges();
  }

}
