import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { HnsPortalService, AlertService, ConfirmationDialogService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-hns-budget-list',
  templateUrl: './hns-budget-list.component.html',
  styleUrls: ['./hns-budget-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsBudgetListComponent implements OnInit {
  @Input() openBudgetList: boolean = false;
  @Input() selectedDefinition: any;
  @Output() closeBudgetList = new EventEmitter<boolean>();
  gridView: DataResult;
  state: State = {
    skip: 0,
    sort: [],
    take: 30,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  // pageSize: number = 30;
  listData: any;
  selectedData: any;
  subs = new SubSink();
  title: string = "";
  disableBtn: boolean = false;
  disableAddBtn: boolean = false;
  openAddBudget: boolean = false;
  formMode: string = 'add';
  hnsPermission: any = [];

  constructor(
    private hnsService: HnsPortalService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    //console.log(this.selectedDefinition);
    if (this.selectedDefinition.hasinuse == "Y") {
      this.title = "Edit Budget List - (In Use - Read Only)";
      this.disableBtn = true;
      this.disableAddBtn = true;
    } else {
      this.title = "Edit Budget List";
      this.disableBtn = false;
      this.disableAddBtn = false;
    }

    this.getBudgetList({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedData = dataItem;
    // if (this.selectedDefinition.hasinuse == "N") {
    //   this.selectedData = dataItem;
    //   //this.disableBtn = false;
    //   // this.subs.add(
    //   //   this.hnsService.validateBudget(dataItem.hascode, dataItem.hasversion, dataItem.hasbudgetcode).subscribe(
    //   //     data => {
    //   //      // console.log(data.data);
    //   //       if (data.isSuccess) {
    //   //         if (data.data == 0) {
    //   //           this.disableBtn = true;
    //   //         } else if (data.data == 1) {
    //   //           this.disableBtn = false;
    //   //         }
    //   //         this.chRef.markForCheck();
    //   //       }
    //   //     }
    //   //   )
    //   // )
    // }

  }

  closeWindowMethod() {
    this.openBudgetList = false;
    this.closeBudgetList.emit(this.openBudgetList)
  }

  getBudgetList(params) {
    this.subs.add(
      this.hnsService.getbudgetList(params).subscribe(
        data => {

          if (data.isSuccess) {
            // const tempData = data.data;
            this.listData = data.data;
            this.gridView = process(this.listData, this.state);
            if (this.selectedDefinition.hasinuse == "N") {
              this.disableAddBtn = false;
              this.disableBtn = true;
            }
            this.chRef.markForCheck();
          }
        }
      )
    )
  }

  public openConfirmationDialog() {
    if (this.selectedData != undefined) {
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.delete() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    }
  }

  delete() {
    this.subs.add(
      this.hnsService.validateBudget(this.selectedData.hascode, this.selectedData.hasversion, this.selectedData.hasbudgetcode).subscribe(
        res => {
          if (res.data == 0) {
            this.alertService.error("This budget code is already in use.")
          } else if (res.data == 1) {
            this.subs.add(
              this.hnsService.deleteBudget(this.selectedData).subscribe(
                data => {
                  if (data.isSuccess) {
                    this.alertService.success(`Budget ${this.selectedData.hasbudgetcode} has been successfully deleted.`)
                    this.getBudgetList({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
                  } else {
                    this.alertService.error(data.message);
                  }
                }
              )
            )
          }
        }
      )
    )


  }

  addBudget(mode) {
    this.formMode = mode;
    if (this.formMode != "add") {
      if (this.selectedData == undefined) {
        this.alertService.error("Please select one record from list.");
        return
      }
    }
    $('.budgetOverlay').addClass('ovrlay');
    this.openAddBudget = true;
  }

  closeAddbudget($event) {
    this.openAddBudget = $event;
    $('.budgetOverlay').removeClass('ovrlay');
  }

  successFullSubmit($event) {
    if ($event) {
      this.getBudgetList({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
    }
  }

}
