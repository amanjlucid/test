import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, WopmConfigurationService } from '../../_services'
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-management-sor',
  templateUrl: './management-sor.component.html',
  styleUrls: ['./management-sor.component.css']
})
export class ManagementSorComponent implements OnInit {

    subs = new SubSink();
    state: State = {
      skip: 0,
      sort: [],
      group: [],
      filter: {
        logic: "and",
        filters: []
      }
    }

    @Input() managementSORTab: boolean = false
    @Input() selectedWorksOrder: any
    @Output() closeManagementSORTab = new EventEmitter<boolean>();

    allowUnsort = true;
    multiple = false;
    public gridView: DataResult;
    SORDetails: any;
    SORDetailsTemp: any
    public mode: any = 'single';
    currentUser: any;
    loading = true
    public title: string = '';
    wopmSecurityList: any = [];


    constructor(
      private wopmConfigurationService: WopmConfigurationService,
      private alertService: AlertService,
      private confirmationDialogService: ConfirmationDialogService,
      private sharedService: SharedService,
      private router: Router,
      private helper: HelperService
    ) { }

    ngOnInit(): void {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      //update notification on top
      this.helper.updateNotificationOnTop();
      let WOName = this.selectedWorksOrder.name != undefined? this.selectedWorksOrder.name:this.selectedWorksOrder.woname;
      this.title = 'Schedule Of Rates: ' +this.selectedWorksOrder.wosequence + ' - ' +  WOName ;
      this.getGridDataDetails();
    }

    ngOnDestroy() {
      this.subs.unsubscribe();
    }

    ngAfterViewInit() {
      this.subs.add(
        this.sharedService.worksOrdersAccess.subscribe(
          data => {
            this.wopmSecurityList = data;
            if (this.wopmSecurityList.length > 0) {
              if (!(this.checkWorksOrdersAccess("SOR Tab") && this.checkWorksOrdersAccess("Works Order Portal Access"))) {
                this.router.navigate(['/dashboard']);
              }
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        )
      )
    }

    checkWorksOrdersAccess(val: string): Boolean {
      if (this.wopmSecurityList != undefined) {
      return this.wopmSecurityList.includes(val);
      } else {
        return false;
      }
    }

    distinctPrimitive(fieldName: string): any {
      return distinct(this.SORDetails, fieldName).map(item => {
        return { val: item[fieldName], text: item[fieldName] }
      });
    }

    getGridDataDetails() {
      this.subs.add(
        this.wopmConfigurationService.getWorksOrderSOR(this.selectedWorksOrder.wosequence).subscribe(
          data => {
            if (data.isSuccess) {
              const SORs = data.data;
              this.SORDetails = SORs;
              this.SORDetailsTemp = Object.assign([], SORs);
              this.gridView = process(this.SORDetailsTemp, this.state);
              this.loading = false;
            }
            else
            {
              this.alertService.error(data.message)
              this.loading = false;
            }
          }
        )
      )
    }


    public sortChange(sort: SortDescriptor[]): void {
      this.state.sort = sort;
      this.gridView = process(this.SORDetailsTemp, this.state);
    }

    public filterChange(filter: any): void {
      this.state.filter = filter;
      this.gridView = process(this.SORDetailsTemp, this.state);

    }

    public onSelectedKeysChange(e) {
     // const len = this.mySelection.length;
    }


   closeSORTab(){
    this.managementSORTab = false;
    this.closeManagementSORTab.emit(false)
  }


}
