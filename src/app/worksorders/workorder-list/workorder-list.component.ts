import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowClassArgs, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, SharedService, WorksOrdersService } from '../../_services'
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkordersListFilterModel } from '../../_models';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-workorder-list',
  templateUrl: './workorder-list.component.html',
  styleUrls: ['./workorder-list.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class WorkorderListComponent implements OnInit {
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
  gridView: DataResult;
  pageSize = 25;
  mySelection: any = [];
  mySelectionKey(context: RowArgs): string {
    return context.dataItem.wosequence
  }
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  worksOrderData: any;
  loading = true;
  selectableSettings: SelectableSettings;
  woFormWindow = false;
  woFormDeleteWindow = false;
  filterObject: WorkordersListFilterModel;
  searchInGrid$ = new Subject<WorkordersListFilterModel>();
  selectedWorksOrder: any
  selectedWorkOrderAddEdit: any;
  woFormType = 'new';
  errorDeleteMsg = '';
  successDeleteMsg = '';
  deleteReasonMsgInput = false;
  wosequenceForDelete: any;
  worksOrderAccess = [];

  // public windowOpened = false;

  constructor(
    private eveneManagerService: WorksOrdersService,
    private activeRoute: ActivatedRoute,
    private alertService: AlertService,
    private helperService: HelperService,
    private sharedService: SharedService,
    private router: Router,
    private helper: HelperService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
    this.setInitialFilterValue();
  }

  ngOnInit(): void {
    //update notification on top
    this.helper.updateNotificationOnTop();

    this.subs.add(
      this.sharedService.worksOrdersAccess.subscribe(
        data => {
          this.worksOrderAccess = data;
        }
      )
    )


    this.getUserWorksOrdersList(this.filterObject, "menuOpen");

    // Filter grid from header filter area
    this.subs.add(
      this.searchInGrid$
        .pipe(
          debounceTime(100),
        ).subscribe(obj => this.getUserWorksOrdersList(obj))
    )

  }



  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.loading = false
      this.getUserWorksOrdersList(this.filterObject);
    }
  }

  getUserWorksOrdersList(filter, menuOpen = null) {
    console.log(filter)
   
    this.subs.add(
      this.eveneManagerService.getListOfUserWorksOrderByUserId(filter).subscribe(
        data => {
          console.log(data)
          if (data.isSuccess) {
            this.worksOrderData = data.data;
            this.gridView = process(this.worksOrderData, this.state);
          } else {
            this.alertService.error(data.message);
          }
         
          this.loading = false;

          //select the row if item exist in local storage
          // if (menuOpen == "menuOpen") {
          //   this.selectedWorksOrder = JSON.parse(localStorage.getItem('worksOrderSingleData'));
          //   this.mySelection = [this.selectedWorksOrder.wosequence];
          //   console.log(this.selectedWorksOrder);
          //   console.log(this.mySelection);
          //   if (this.selectedWorksOrder) {
          //     setTimeout(() => {
                
          //       setTimeout(() => {
          //         document.querySelector('.k-state-selected').scrollIntoView();
          //         setTimeout(() => {
          //           $('.selectedMenuBar' + this.selectedWorksOrder.wosequence).prev().trigger('click');
          //         }, 200);
          //       }, 100);

          //     }, 2000);
          //   }
          // }

          this.chRef.detectChanges();
        },
        err => this.alertService.error(err)
      )
    )
  }


  sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.worksOrderData, this.state);
  }

  filterChange(filter: any): void {
    this.state.filter = filter;
    this.gridView = process(this.worksOrderData, this.state);
  }

  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.worksOrderData.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.worksOrderData.length
    };
  }


  cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    this.selectedWorksOrder = dataItem;

  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }

  filterGrid($event) {
    this.searchInGrid$.next(this.filterObject);
  }

  setSeletedRow(dataItem) {
    this.selectedWorksOrder = dataItem;
    this.mySelection = [this.selectedWorksOrder.wosequence];
  }

  openUserPopup(action, item = null) {
    $('.bgblur').addClass('ovrlay');
    this.woFormType = action;
    this.selectedWorkOrderAddEdit = item;
    this.woFormWindow = true;
  }

  resetFilter() {
    this.setInitialFilterValue();
    this.searchInGrid$.next(this.filterObject);
  }

  setInitialFilterValue() {
    this.filterObject = {
      UserId: this.currentUser.userId,
      ActiveInactive: 'A',
      Address: '',
      WoName: '',
      Woextref: '',
      Wosequence: null
    }
  }

  redirectToWorksOrder(item) {
    this.selectedWorksOrder = item;
    this.sharedService.changeWorksOrderSingleData(item);
    localStorage.setItem('worksOrderSingleData', JSON.stringify(item)); // remove code on logout service
    this.router.navigate(['worksorders/details']);
  }

  rowCallback(context: RowClassArgs) {
    return { notNew: context.dataItem.wostatus != "New" }
  }


  redirectToWorksOrderEdit(item) {
    $('.bgblur').addClass('ovrlay');
    this.woFormType = 'edit';
    this.selectedWorkOrderAddEdit = item;
    this.woFormWindow = true;

  }

  closewoFormDeleteWindow() {
    this.woFormDeleteWindow = false;
  }



  deleteThis(item) {


    this.wosequenceForDelete = item.wosequence;

    this.errorDeleteMsg = '';
    this.successDeleteMsg = '';

    let reason = 'no';
    let userId = this.currentUser.userId;
    let checkOrProcess = 'C';


    this.eveneManagerService.DeleteWebWorkOrder(this.wosequenceForDelete, reason, userId, checkOrProcess).subscribe(
      (data) => {


        if (data.isSuccess) {

          if (data.data.pRETURNSTATUS == 'E') {
            this.errorDeleteMsg = data.data.pRETURNMESSAGE;
            this.deleteReasonMsgInput = false;

          }

          else if (data.data.pRETURNSTATUS == 'S') {

            this.errorDeleteMsg = '';
            this.deleteReasonMsgInput = true;

          }
          else {

            this.errorDeleteMsg = '';
            this.deleteReasonMsgInput = true;
          }




        }

        console.log('Delete Data Return ' + JSON.stringify(data.data));

      },
      error => {
        this.alertService.error(error);

      }
    )



    this.woFormDeleteWindow = true;


  }


  finalDeleteSubmit(reason) {

    this.errorDeleteMsg = '';
    this.successDeleteMsg = '';

    if (reason == '' || reason == null) {
      this.errorDeleteMsg = 'You must enter a reason for deleting a Works Order';

    }
    else {

      let userId = this.currentUser.userId;
      let checkOrProcess = 'P';



      this.eveneManagerService.DeleteWebWorkOrder(this.wosequenceForDelete, reason, userId, checkOrProcess).subscribe(
        (data) => {


          if (data.isSuccess) {

            if (data.data.pRETURNSTATUS == 'E') {
              this.errorDeleteMsg = data.data.pRETURNMESSAGE;

              this.alertService.error(data.data.pRETURNMESSAGE);

            }
            else {

              this.deleteReasonMsgInput = false;
              this.successDeleteMsg = 'Works Order Deleted';


              this.alertService.success(this.successDeleteMsg);


              this.woFormDeleteWindow = false;
              this.getUserWorksOrdersList(this.filterObject);


            }






          }

          console.log('Final Delete ' + JSON.stringify(data.data));

        },
        error => {
          this.alertService.error(error);

        }
      )







    }



  }
  // public close() {
  //   $('.bgblur').removeClass('ovrlay');
  //   this.windowOpened = false;
  // }


  closeWoFormWin($event) {
    this.woFormWindow = $event;
    $('.bgblur').removeClass('ovrlay');
    this.getUserWorksOrdersList(this.filterObject);
  }








}
