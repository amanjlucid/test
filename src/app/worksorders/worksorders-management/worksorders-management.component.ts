import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, SelectableSettings, TreeListComponent, ExpandEvent, RowClassArgs } from '@progress/kendo-angular-treelist';
import { AlertService, HelperService, WorksorderManagementService, ConfirmationDialogService, SharedService, WorksOrdersService } from '../../_services'
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { SortDescriptor } from '@progress/kendo-data-query';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-worksorders-management',
  templateUrl: './worksorders-management.component.html',
  styleUrls: ['./worksorders-management.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class WorksordersManagementComponent implements OnInit {
  managementformMode = 'new';
  subs = new SubSink(); // to unsubscribe services
  openNewManagement: boolean = false;
  loading = true;
  public selected: any[] = [];
  public filter: CompositeFilterDescriptor;
  columnLocked = true;
  public settings: SelectableSettings = {
    mode: 'row',
    multiple: false,
    drag: false,
    enabled: true
  };
  sort: SortDescriptor[] = [
    //   {
    //   field: 'wosequence',
    //   dir: 'asc'
    // }, {
    //   field: 'name',
    //   dir: 'asc'
    // }
  ];
  gridPageSize = 25;
  public apiData: any = [];
  public groupedData: any = [];
  public gridData: any = [];
  @ViewChild(TreeListComponent) public grid: TreeListComponent;
  selectedProgramme: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  worksOrderAccess = [];

  packageMappingWindow = false
  worksOrderSingleData: any;
  deleteWorksOrderReasonWindow = false;
  selctedWorksOrder: any;
  reasonToDeleteWO: string;

  woFormType = 'new';
  woFormWindow: boolean = false;

  worksOrderUsrAccess: any = [];
  userType: any = []

  constructor(
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService,
    private router: Router,
    private worksOrderService: WorksOrdersService,

  ) { }

  ngOnInit(): void {
    //update notification on top
    this.helperService.updateNotificationOnTop();

    this.subs.add(
      combineLatest([
        this.sharedService.worksOrdersAccess,
        this.sharedService.woUserSecObs,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          console.log(data);

          this.worksOrderAccess = data[0];
          this.worksOrderUsrAccess = data[1];
          this.userType = data[2][0];

          if (this.worksOrderAccess.length > 0) {
            if (!this.worksOrderAccess.includes("Programme Management")) {
              this.alertService.error("No access")
              this.router.navigate(['login']);
            }
          }

        }
      )
    )

    // this.subs.add(
    //   this.sharedService.woUserSecObs.subscribe(
    //     data => {
    //       this.worksOrderUsrAccess = data;
    //       // console.log(this.worksOrderUsrAccess)
    //     }
    //   )
    // )

    // this.subs.add(
    //   this.sharedService.worksOrdersAccess.subscribe(
    //     data => {
    //       this.worksOrderAccess = data;
    //       // console.log(this.worksOrderAccess);
    //       if (this.worksOrderAccess.length > 0) {
    //         if (!this.worksOrderAccess.includes("Programme Management")) {
    //           this.router.navigate(['login']);
    //         }
    //       }
    //     }
    //   )
    // )

    this.getManagement();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  rowCallback(context: RowClassArgs) {
    if (context.dataItem.treelevel == 1) {
      return { level1: true, }
    }
    if (context.dataItem.treelevel == 2) {
      return { level2: true, }
    }
    if (context.dataItem.treelevel == 3) {
      return { level3: true, }
    }
  }

  getManagement(status = "A") {
    this.subs.add(
      this.worksorderManagementService.getManagementData(status).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess) {
            let gridData = [];
            this.apiData = [...data.data];
            let tempData = [...data.data];
            let groupBywprsequence = tempData.reduce((r, a) => {
              r[a.wprsequence] = [...r[a.wprsequence] || [], a];
              return r;
            }, {});

            this.groupedData = [...groupBywprsequence];

            //Find parent and Set parent id in each row
            tempData.forEach((value, index) => {
              // if(value.name == "Test New Special Items 1"){
              //   console.log(value)
              // }

              if (value.treelevel == 1) {
                value.parentId = null;
                value.id = `${value.wopsequence}${value.wosequence}${value.wprsequence}`;
                gridData.push(value)
              }

              if (value.treelevel == 2) {
                const parent = groupBywprsequence[value.wprsequence].find(x => x.treelevel == 1 && x.wprsequence == value.wprsequence);
                if (parent) {
                  value.parentId = `${parent.wopsequence}${parent.wosequence}${parent.wprsequence}`;
                  value.id = `${value.wopsequence}${value.wosequence}${value.wprsequence}`;
                  gridData.push(value)
                }

              }

              if (value.treelevel == 3) {
                const parent = groupBywprsequence[value.wprsequence].find(x => x.treelevel == 2 && x.wprsequence == value.wprsequence && x.wosequence == value.wosequence);
                if (parent) {
                  value.parentId = `${parent.wopsequence}${parent.wosequence}${parent.wprsequence}`;
                  value.id = `${value.wopsequence}${value.wosequence}${value.wprsequence}`;
                  gridData.push(value)
                }
              }

            })

            setTimeout(() => {
              this.gridData = [...gridData];
              this.loading = false
            }, 100);

          } else {
            this.alertService.error(data.message);
            this.loading = false
          }

        },
        err => this.alertService.error(err)
      )
    )
  }

  public onFilterChange(filter: any): void {
    this.filter = filter;
  }

  cellClickHandler($event) {
    if ($event.dataItem.treelevel == 2) {
      this.setSeletedWORow($event.dataItem);
    }
    // console.log($event)
    // console.log(this.selected)
  }

  public clearSelection(): void {
    this.selected = [];
  }


  checkActiveInactive($event) {
    this.loading = true;
    this.gridData = [];
    this.getManagement($event.target.value)
  }


  openNewManagementWindow(mode = 'new') {
    this.managementformMode = mode;
    $('.newManagementOverlay').addClass('ovrlay');
    this.openNewManagement = true;
  }

  closeNewManagementEvent(event) {
    this.openNewManagement = event;
    $('.newManagementOverlay').removeClass('ovrlay');
  }

  async export() {
    $('.newManagementOverlay').addClass('ovrlay');
    await this.resetOnExport(this.grid.view.total)
    setTimeout(async () => {
      let gridState = [...this.grid.view.data];
      this.resetOnExport(25);

      if (gridState.length != undefined && gridState.length > 0) {
        this.gridStateExport(gridState);
      } else {
        $('.newManagementOverlay').removeClass('ovrlay');
        this.alertService.error('There is not record to export');
      }

    }, 1000);

  }

  resetOnExport(pageSize) {
    setTimeout(() => {
      this.gridPageSize = pageSize;
      let gridData = [...this.gridData];
      this.gridData = [];
      this.gridData = gridData;
      this.chRef.detectChanges();
    }, 100);
  }

  gridStateExport(gridState) {
    let dataToExport = gridState.map(x => { return x.data });
    // console.log(dataToExport);
    let label = {
      'name': 'Name',
      'wprstatus': 'Status',
      'budget': 'Budget',
      'forecast': 'Forcast',
      'committed': 'Commited',
      'issued': 'Issued',
      'wpracceptedvalue': 'Accepted',
      'actual': 'Actual',
      'approved': 'Approved',
      'pending': 'Pending',
      'payments': 'Payments',
      'targetcompletiondate': 'Target Date',
      'wprcontractorissuedate': 'Issued Date',
      'wprcontractoracceptancedate': 'Acceptance Date',
      'wprplanstartdate': 'Plan Start Date',
      'wprplanenddate': 'Plan End Date',
      'wpractualstartdate': 'Actual Start Date',
      'wpractualenddate': 'Actual End Date',
      'new': 'New',
      'wip': 'WIP',
      'handover': 'Handover',
      'pc': 'PC',
      'fc': 'FC',
    }
    this.helperService.exportAsExcelFile(dataToExport, 'Programme', label)
    setTimeout(() => $('.newManagementOverlay').removeClass('ovrlay'), 500);

  }

  refreshManagementGrid(event) {
    if (event) {
      this.getManagement();
      this.selectedProgramme = undefined;
    }
  }

  public openConfirmationDialog(item) {
    this.selectedProgramme = item;
    if (this.selectedProgramme != undefined) {
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', `Delete Programme "${this.selectedProgramme.name}" ?`)
        .then((confirmed) => (confirmed) ? this.deleteProgramme() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    } else {
      this.alertService.error('Please select one record');
    }
  }

  deleteProgramme() {
    if (this.selectedProgramme != undefined) {
      const params = {
        WPRSEQUENCE: this.selectedProgramme.wprsequence,
        userId: this.currentUser.userId,
        CheckOrProcess: 'P'
      }

      this.worksorderManagementService.deleteWorkOrderManagement(params).subscribe(
        data => {
          if (data.isSuccess && data.data == "S") {
            this.alertService.success(data.message);
            this.refreshManagementGrid(true);
            this.selectedProgramme = undefined //reset selected programme after delete
          } else {
            this.alertService.error(data.message);
          }
        },
        err => this.alertService.error(err)
      )
    }


  }

  setSeletedRow(dataItem) {
    // console.log(this.selectedProgramme);
    if (this.selectedProgramme?.wprsequence != dataItem.wprsequence) {
      this.helperService.getWorkOrderSecurity(dataItem.wosequence);
      this.helperService.getUserTypeWithWOAndWp(dataItem.wosequence, dataItem.wprsequence);
    }

    this.selectedProgramme = dataItem

  }


  openPackageMappingWindow(dataItem) {
    this.worksOrderSingleData = dataItem
    this.packageMappingWindow = true;
    $('.newManagementOverlay').addClass('ovrlay');
  }

  cloasePackageMappingWindow(eve) {
    this.packageMappingWindow = eve;
    $('.newManagementOverlay').removeClass('ovrlay');
  }

  redirectToWorksOrder(item) {
    this.sharedService.changeWorksOrderSingleData(item);
    localStorage.setItem('worksOrderSingleData', JSON.stringify(item)); // remove code on logout service
    this.router.navigate(['worksorders/details']);
  }

  lockUnlockColumn() {
    this.columnLocked = !this.columnLocked
  }

  deleteWorksOrder(worksOrderItem, reason = "no", checkOrProcess = "C") {
    this.selctedWorksOrder = worksOrderItem;
    this.subs.add(
      this.worksOrderService.DeleteWebWorkOrder(worksOrderItem.wosequence, reason, this.currentUser.userId, checkOrProcess).subscribe(
        data => {
          // console.log(data);
          if (data.isSuccess && data.data.pRETURNSTATUS == "S") {
            this.deleteWorksOrderReasonWindow = true;
          } else if (data.data.pRETURNSTATUS == "E") {
            this.alertService.error(data.data.pRETURNMESSAGE)
          } else {
            this.alertService.error(data.data.pRETURNMESSAGE)
          }
        }
      )
    )
  }

  finalDelete() {
    if (this.reasonToDeleteWO == "" || this.reasonToDeleteWO == undefined) {
      this.alertService.error("You must enter a reason for deleting a Works Order");
      return
    }

    this.subs.add(
      this.worksOrderService.DeleteWebWorkOrder(this.selctedWorksOrder.wosequence, this.reasonToDeleteWO, this.currentUser.userId, "P").subscribe(
        data => {
          // console.log(data);
          if (data.data.pRETURNSTATUS == "E") {
            this.alertService.error(data.data.pRETURNMESSAGE)
          } else {
            this.alertService.success(data.data.pRETURNMESSAGE);
            this.refreshManagementGrid(true);
            this.closeWorksorderReasonWindow()
          }
        }
      )
    )
  }

  closeWorksorderReasonWindow() {
    this.deleteWorksOrderReasonWindow = false;
    this.reasonToDeleteWO = undefined
  }


  openWorksOrderForm(action, item = null) {

    if (item?.treelevel == 2 && action == "edit") {
      this.selctedWorksOrder = item;
    }

    if (item?.treelevel == 1 && action == "new") {
      this.selectedProgramme = item
    }

    if (item == null && action == "new") {
      this.selctedWorksOrder = item
    }

    $('.newManagementOverlay').addClass('ovrlay');
    this.woFormType = action;
    this.woFormWindow = true;
  }

  closeWoFormWin($event) {
    this.woFormWindow = $event;
    $('.newManagementOverlay').removeClass('ovrlay');
    this.refreshManagementGrid(true);
  }


  setSeletedWORow(dataItem) {
   
    if (this.selctedWorksOrder?.wosequence != dataItem.wosequence) {
      this.helperService.getWorkOrderSecurity(dataItem.wosequence)
      this.helperService.getUserTypeWithWOAndWp(dataItem.wosequence, dataItem.wprsequence);
    }

    this.selctedWorksOrder = dataItem;
  }

  programmeMenuAccess(menuName){
    return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
  }

  woMenuAccess(menuName) {
    // console.log(this.userType)
    if (this.userType == undefined) return true;

    if (this.userType?.wourroletype == "Dual Role") {
      return this.worksOrderAccess.indexOf(menuName) != -1 || this.worksOrderUsrAccess.indexOf(menuName) != -1
    }

    return this.worksOrderUsrAccess.indexOf(menuName) != -1
  }

}
