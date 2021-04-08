import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, SelectableSettings, TreeListComponent, ExpandEvent } from '@progress/kendo-angular-treelist';
import { AlertService, HelperService, WorksorderManagementService, ConfirmationDialogService, SharedService } from '../../_services'
import { SubSink } from 'subsink';
import { Router } from '@angular/router';

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
  public settings: SelectableSettings = {
    mode: 'row',
    multiple: false,
    drag: false,
    enabled: true
  };
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

  constructor(
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    //update notification on top
    this.helperService.updateNotificationOnTop();
    this.sharedService.worksOrdersAccess.subscribe(
      data => {
        this.worksOrderAccess = data;
        // console.log(this.worksOrderAccess)

      }
    )

    this.getManagement();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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

}
