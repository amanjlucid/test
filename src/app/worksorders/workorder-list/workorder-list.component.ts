import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { State } from '@progress/kendo-data-query';
import { SelectableSettings, RowClassArgs } from '@progress/kendo-angular-grid';
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
    sort: [{
      field: 'wosequence',
      dir: 'desc'
    }],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  worksOrderData: any;
  loading = true;
  selectableSettings: SelectableSettings;
  userFormWindow = false;
  filterObject: WorkordersListFilterModel;
  searchInGrid$ = new Subject<WorkordersListFilterModel>();
  selectedWorksOrder: any
  // public userFormWindow = false;
  // public windowOpened = false;

  constructor(
    private eveneManagerService: WorksOrdersService,
    private activeRoute: ActivatedRoute,
    private alertService: AlertService,
    private helperService: HelperService,
    private sharedService: SharedService,
    private router: Router,
    private helper: HelperService
  ) {
    this.setSelectableSettings();
    this.setInitialFilterValue();
  }

  ngOnInit(): void {
    //update notification on top
    this.helper.updateNotificationOnTop();

    this.getUserWorksOrdersList(this.filterObject);

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

  getUserWorksOrdersList(filter) {
    this.subs.add(
      this.eveneManagerService.getListOfUserWorksOrderByUserId(filter).subscribe(
        data => {
          console.log(data)
          if (data.isSuccess) this.worksOrderData = data.data
          else this.alertService.error(data.message);
          this.loading = false;
        },
        err => this.alertService.error(err)
      )
    )
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
    // this.selectedEvent.push(dataItem)
  }

  openUserPopup(action, item = null) {
    $('.bgblur').addClass('ovrlay');
    // this.userFormType = action;
    // this.selectedUser = item;
    // this.userFormWindow = true;
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

  // public close() {
  //   $('.bgblur').removeClass('ovrlay');
  //   this.windowOpened = false;
  // }
  // closeUserFormWin($event) {
  //   this.userFormWindow = $event;
  //   $('.bgblur').removeClass('ovrlay');
  //   //this.getUserList();
  // }








}
