import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { SortDescriptor, State, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, SelectableSettings, TreeListComponent, ExpandEvent, RowClassArgs} from '@progress/kendo-angular-treelist';
import { AlertService, HelperService, WorksorderManagementService, ConfirmationDialogService, SharedService, WorksOrdersService } from '../../_services'
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';

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
  touchtime = 0;
  packageMappingWindow = false
  worksOrderSingleData: any;
  deleteWorksOrderReasonWindow = false;
  selctedWorksOrder: any;
  reasonToDeleteWO: string;
  managementRolesTab = false
  managementSORTab = false
  managementCostsTab = false
  selectedStatus: string = "A";
  woFormType = 'new';
  woFormWindow: boolean = false;

  worksOrderUsrAccess: any = [];
  userType: any = []

  woProgramManagmentInstructionsWindow = false;

  completionList = false;

  workOrderId: number;

  selectedWorksOrder: any;
  ProgrammeLogWindow = false;
  WoAssociationsManageWindow = false;
  openManageMilestone = false;
  openMilestoneFor = "checklist";
  programmeLogFor = "workorder"
  openWOPaymentScheduleWindow = false;

  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  @HostListener('click', ['$event']) onClick(event) {
    const element = event.target as HTMLElement;
    if (element.className.indexOf('fas fa-bars') == -1) {
      this.hideMenu();
    }
  }
  menuData: any;
  mousePositioin: any = 0;

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
        this.sharedService.woUserSecObs,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          this.worksOrderUsrAccess = data[0];
          this.userType = data[1][0];
        }
      )
    )


    this.getManagement();
  }

  woMenuBtnSecurityAccess(menuName) {
    return this.worksOrderUsrAccess.indexOf(menuName) != -1
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    const elements = document.querySelectorAll('.menuDiv .dropdown-item');
    elements.forEach(element => {
      element.removeEventListener("click", (e) => { this.hideMenu() });
    });
  }

  ngAfterViewInit() {
    document.querySelector('.k-grid .k-grid-content').addEventListener('scroll', (e) => {
      this.tooltipDir.hide();
    });
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
      this.worksorderManagementService.getVW_PROGRAMMES_WORKS_ORDERs(status, this.currentUser.userId).subscribe(
        data => {
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
    if ($event.dataItem.treelevel == 1) {
      this.selectedProgramme = $event.dataItem;
    }

    if ($event.dataItem.treelevel == 2) {
      this.setSeletedWORow($event.dataItem);
      let dataItem = $event.dataItem
      if (this.selctedWorksOrder.wosequence)
        if (this.touchtime == 0) {
          this.touchtime = new Date().getTime();
        } else {
          if (((new Date().getTime()) - this.touchtime) < 400) {
            //open work order detail window
            setTimeout(() => { this.redirectToWorksOrder(dataItem) }, 200);
            this.touchtime = 0;
          } else {
            // not a double click so set as a new first click
            this.touchtime = new Date().getTime();
          }

        }

    }




  }

  public clearSelection(): void {
    this.selected = [];
  }


  checkActiveInactive($event) {
    this.selectedStatus = $event.target.value;
    this.loading = true;
    this.gridData = [];
    this.getManagement( this.selectedStatus)
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
    let label = {
      'name': 'Name',
      'wprstatus': 'Status',
      'budget': 'Budget',
      'forecast': 'Forecast',
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
      this.getManagement(this.selectedStatus);
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


  getTopMargin() {
    if (this.mousePositioin == undefined) return;
    const { y } = this.mousePositioin;
    if ((y > 550 && y <= 700) && this.menuData.treelevel == 2) return "-230px";
    if ((y > 700 && y <= 800) && this.menuData.treelevel == 2) return "-350px";
    if ((y > 800) && this.menuData.treelevel == 2) return "-390px";
    return "-100px";

  }

  openMenu(e, dataItem) {
    if (dataItem != undefined) {
      if (dataItem.treelevel == 1) {
        if (this.selectedProgramme?.wprsequence != dataItem.wprsequence) {
          this.helperService.getWorkOrderSecurity(dataItem.wosequence);
          this.helperService.getUserTypeWithWOAndWp(dataItem.wosequence, dataItem.wprsequence);
        }
        this.selectedProgramme = dataItem
      }

      if (dataItem.treelevel == 2) {
        if (this.selctedWorksOrder?.wosequence != dataItem.wosequence) {
          this.helperService.getWorkOrderSecurity(dataItem.wosequence)
          this.helperService.getUserTypeWithWOAndWp(dataItem.wosequence, dataItem.wprsequence);
        }

        this.selctedWorksOrder = dataItem;
      }

      this.mousePositioin = { x: e.pageX, y: e.pageY };
      const element = e.target as HTMLElement;
      this.menuData = dataItem;
      this.tooltipDir.toggle(element);

      const elements = document.querySelectorAll('.menuDiv .dropdown-item');
      elements.forEach(element => {
        element.addEventListener("click", (e) => { this.hideMenu() });
      });
    }

  }


  hideMenu() {
    this.tooltipDir.hide();
    this.menuData = undefined;
  }



  setSeletedRow(dataItem) {
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
    if (this.UserMenuAccess('Works Order Detail')){
      this.sharedService.changeWorksOrderSingleData(item);
      localStorage.setItem('worksOrderSingleData', JSON.stringify(item)); // remove code on logout service
      this.router.navigate(['worksorders/details']);
    }
  }

  lockUnlockColumn() {
    this.columnLocked = !this.columnLocked
  }

  deleteWorksOrder(worksOrderItem, reason = "no", checkOrProcess = "C") {
    this.selctedWorksOrder = worksOrderItem;
    this.subs.add(
      this.worksOrderService.DeleteWebWorkOrder(worksOrderItem.wosequence, reason, this.currentUser.userId, checkOrProcess).subscribe(
        data => {
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

  UserMenuAccess(menuName) {
    return this.worksOrderUsrAccess.indexOf(menuName) != -1
  }

  redirectToWoProgramManagmentInstructions(item) {
    this.selctedWorksOrder = item;
    this.woProgramManagmentInstructionsWindow = true;
    $('.newManagementOverlay').addClass('ovrlay');
  }

  closeWoProgramManagmentInstructionsWin(eve) {
    this.woProgramManagmentInstructionsWindow = eve;
    $('.newManagementOverlay').removeClass('ovrlay');
  }


  openCompletionList(item) {
    $('.newManagementOverlay').addClass('ovrlay');
    this.selctedWorksOrder = item;
    this.completionList = true;
  }


  closeCompletionList($event) {
    this.completionList = $event;
    $('.newManagementOverlay').removeClass('ovrlay');
  }

  openProgrammeLog(openFor, item) {
    this.programmeLogFor = openFor;
    if (openFor == "programme") this.selectedProgramme = item;
    if (openFor == "workorder") this.selectedWorksOrder = item;
    $('.newManagementOverlay').addClass('ovrlay');
    this.ProgrammeLogWindow = true;
  }

  closeProgrammeLogWindow(eve) {
    this.ProgrammeLogWindow = eve;
    $('.newManagementOverlay').removeClass('ovrlay');
  }


  openWoAssociationsManage(item) {
    this.selectedWorksOrder = item;
    $('.newManagementOverlay').addClass('ovrlay');
    this.WoAssociationsManageWindow = true;
  }

  closeWoAssociationsManageWindowMain(eve) {
    this.WoAssociationsManageWindow = eve;
    $('.newManagementOverlay').removeClass('ovrlay');
  }

  openRolesTab(dataItem) {
    this.worksOrderSingleData = dataItem;
    this.managementRolesTab = true;
    $('.newManagementOverlay').addClass('ovrlay');
  }

  openCostsTab(dataItem) {
    this.worksOrderSingleData = dataItem;
    this.managementCostsTab = true;
    $('.newManagementOverlay').addClass('ovrlay');
  }

  openSORTab(dataItem) {
    this.worksOrderSingleData = dataItem;
    this.managementSORTab = true;
    $('.newManagementOverlay').addClass('ovrlay');
  }

  closeManagementRolesTab($event) {
    this.managementRolesTab = false;
    $('.newManagementOverlay').removeClass('ovrlay');
    //this.refreshManagementGrid(true);
  }

  closeManagementCostsTab($event) {
    this.managementCostsTab = false;
    $('.newManagementOverlay').removeClass('ovrlay');
    //this.refreshManagementGrid(true);
  }

  closeManagementSORTab($event) {
    this.managementSORTab = false;
    $('.newManagementOverlay').removeClass('ovrlay');
    //this.refreshManagementGrid(true);
  }

  openManageMilestonePopup(item, openFor) {
    this.openMilestoneFor = openFor;
    this.selectedWorksOrder = item;
    this.openManageMilestone = true;
    $('.newManagementOverlay').addClass('ovrlay');

  }

  closeManageMilestone($event) {
    $('.newManagementOverlay').removeClass('ovrlay');
    this.openManageMilestone = $event;
  }

  programmeReport(reportType, item = null) {
    let wprsequence = 0;
    let wosequence = 0;
    let reporttype = reportType;

    if (reporttype == 1) {
      this.selectedProgramme = item;
      wprsequence = this.selectedProgramme.wprsequence;
      wosequence = this.selectedProgramme.wosequence;
    }

    this.subs.add(
      this.worksOrderService.WOReportingProgSummaryTree(wprsequence, wosequence, reporttype).subscribe(
        data => {
          if (data.isSuccess) {
            this.programmeExport(data.data);
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )

  }


  programmeExport(data) {
    let label = {
      'programme': 'Programme',
      'works_Order': 'Works Order',
      'phase': 'Phase',
      'budget': 'Budget',
      'forecast': 'Forecast',
      'committed': 'Committed',
      'accepted': 'Accepted',
      'actual': 'Actual',
      'approved': 'Approved',
      'pending': 'Pending',
      'payments': 'Payments',
      'actual___Planned_Start_Date': 'Start Date',
      'actual___Planned_End_Date': 'End Date',
      'target_Date': 'Target Date',
      'new': 'New Count',
      'issued': 'Issued Count',
      'wip': 'In Progress Count',
      'handover': 'Handover Count',
      'pc': 'Practical Comp Count',
      'fc': 'Final Comp Count',
      'status': 'Status',
      'counts': 'Counts',
    };

    const fieldsToFormat = {
      'actual___Planned_Start_Date': 'date',
      'actual___Planned_End_Date': 'date',
      'budget': 'money',
      'forecast': 'money',
      'committed': 'money',
      'accepted': 'money',
      'actual': 'money',
      'approved': 'money',
      'pending': 'money',
      'payments': 'money',
    }

    this.helperService.exportAsExcelFileWithCustomiseFields(data, 'Programme Report', label, fieldsToFormat)

  }


  openWOPMPaymentSchedule(item) {
    this.selectedWorksOrder = item;
    $('.newManagementOverlay').addClass('ovrlay');
    this.openWOPaymentScheduleWindow = true;
  }

  closePaymentScheduleWindow($event) {
    $('.newManagementOverlay').removeClass('ovrlay');
    this.openWOPaymentScheduleWindow = $event;
  }


}
