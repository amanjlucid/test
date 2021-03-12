import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { filterBy, FilterDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FilterService, SelectableSettings, TreeListComponent } from '@progress/kendo-angular-treelist';
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
  loading = false
  public filter: CompositeFilterDescriptor;
  public settings: SelectableSettings = {
    mode: 'row',
    multiple: false,
    drag: false,
    enabled: true
  };
  public apiData:any = []
  public gridData: any = [];
  // @ViewChild(TreeListComponent) public grid: TreeListComponent;

  constructor(
    private worksorderManagementService: WorksorderManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    // this.getManagement();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getManagement(status = "A"){
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

            // setTimeout(() => {
            //   this.gridData = [...gridData];
            //    console.log(this.gridData);
            //   this.loading = false
            // }, 100);

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

  // public titleChange(values: any[], filterService: FilterService): void {
  //   filterService.filter({
  //     filters: values.map(value => ({
  //       field: 'title',
  //       operator: 'eq',
  //       value
  //     })),
  //     logic: 'or'
  //   });
  // }

  checkActiveInactive($event){
    this.loading = true;
    this.gridData = [];
    this.getManagement($event.target.value)
  }

  // public titleFilters(filter: CompositeFilterDescriptor): FilterDescriptor[] {
  //   this.titleFilter.splice(
  //     0, this.titleFilter.length,
  //     ...flatten(filter).map(({ value }) => value)
  //   );
  //   return this.titleFilter;
  // }



  //############### Code for the Management

  openNewManagementWindow() {
    $('.newManagementOverlay').addClass('ovrlay');
    this.openNewManagement = true;
  }

  closeNewManagementEvent(event) {
    this.openNewManagement = event;
    $('.newManagementOverlay').removeClass('ovrlay');
  }

  export(){
    // console.log(this.grid);
  }


}
