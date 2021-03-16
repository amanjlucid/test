import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { filterBy, FilterDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, SelectableSettings, TreeListComponent, ExpandEvent } from '@progress/kendo-angular-treelist';
import { AlertService, HelperService, WorksorderManagementService } from '../../_services'
import { SubSink } from 'subsink';

@Component({
  selector: 'app-worksorders-management',
  templateUrl: './worksorders-management.component.html',
  styleUrls: ['./worksorders-management.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class WorksordersManagementComponent {
  managementformMode = 'new';
  subs = new SubSink(); // to unsubscribe services
  openNewManagement: boolean = false;
  loading = true
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

  constructor(
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
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
              //  console.log(this.gridData);
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

  public selected: any[] = [];

  public clearSelection(): void {
    this.selected = [];
  }


  checkActiveInactive($event) {
    this.loading = true;
    this.gridData = [];
    this.getManagement($event.target.value)
  }

  
  openNewManagementWindow() {
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
      // 'eventTypeDesc': 'Event',
      // 'eventRowCount': 'Record(s)',
      // 'processedPercentage': 'Processed(%)',
      // 'eventCreatedDate': 'Created',
      // 'eventStatusName': 'Status',
      // 'eventEscStatusName': 'Esc',
      // 'eventSevTypeName': 'Severity',
      // 'eventAskTypeName': 'Action',
      // 'eventAssignUserName': 'Assigned To',
      // 'eventPlannedDate': 'Planned',
      // 'eventCreatedBy': 'Created By',
      // 'eventUpdatedBy': 'Updated By',
      // 'eventUpdateDate': 'Updated',
    }
    this.helperService.exportAsExcelFile(dataToExport, 'Programme', label)
    setTimeout(() => $('.newManagementOverlay').removeClass('ovrlay'), 500);

  }


}
