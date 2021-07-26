import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, WopmConfigurationService } from '../../../_services'
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { WopmMasterStageModel } from '../../../_models'

@Component({
  selector: 'app-wopm-masterstages',
  templateUrl: './wopm-masterstages.component.html',
  styleUrls: ['./wopm-masterstages.component.css']
})

export class WopmMasterstagesComponent implements OnInit {
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
  
    allowUnsort = true;
    multiple = false;
    public gridView: DataResult;
    pageSize = 25;
    masterStages: any;
    masterStagesTemp: any
    selectedStages: any = [];
    wopmMasterStagesModel;
    touchtime = 0;
    public checkboxOnly = false;
    public mode: any = 'single';
    public mySelection: number[] = [];
    public selectableSettings: SelectableSettings;
    currentUser: any;
    editEvent: boolean = false;
    loading = true;
    wopmSecurityList: any = [];
    public status: string = "A";
    public stageFormWindow: boolean = false;
    public stageFormType: any;
    public disableBtn: boolean = false;

  
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
      this.setSelectableSettings();
      this.getMasterStages();
      //update notification on top
      this.helper.updateNotificationOnTop();
    }
  
    ngOnDestroy() {
      this.subs.unsubscribe();
    }
  
    ngAfterViewInit() {
      this.subs.add(
        this.sharedService.worksOrdersAccess.subscribe(
          data => {
            if (data) {
              this.wopmSecurityList = data;
              if (this.wopmSecurityList.length > 0) {
                if (!(this.checkWorksOrdersAccess("Master Stages") && this.checkWorksOrdersAccess("Works Order Portal Access"))) {
                        this.router.navigate(['/dashboard']);
                      }
              }
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
      return distinct(this.masterStages, fieldName).map(item => {
        return { val: item[fieldName], text: item[fieldName] }
      });
    }
  
    getMasterStages() {
      this.subs.add(
        this.wopmConfigurationService.getWorksOrdersStageMasterList().subscribe(
          data => {
            if (data.isSuccess) {
              let stages = data.data;
              stages.map(item => {
                item.mPgpA = new Date(item.mPgpA);
                item.mPgsA = new Date(item.mPgsA);
                item.wostagestatus = (item.wostagestatus == "A") ? "Active" :"Inactive";
              });
              this.masterStages = stages;
              this.masterStagesTemp = Object.assign([], stages);
              // this.masterStagesTemp = data.data.slice(this.state.skip, 30) // remove it
              // this.masterStagesTemp =  Object.assign([], this.masterStages);  // remove it
              this.gridView = process(this.masterStagesTemp, this.state);
              this.loading = false;
            }
          }
        )
      )
    }
  
    public groupChange(groups: GroupDescriptor[]): void {
      this.state.group = groups;
      setTimeout(() => {
        this.gridView = process(this.masterStagesTemp, this.state);
      }, 100);
    }
  
  
    public sortChange(sort: SortDescriptor[]): void {
      this.state.sort = sort;
      this.gridView = process(this.masterStagesTemp, this.state);
    }
  
    public filterChange(filter: any): void {
      this.state.filter = filter;
      this.gridView = process(this.masterStagesTemp, this.state);
  
    }
  

  
    renderGrid(tempGrid: any, timer = 20) {
      setTimeout(() => {
        this.gridView = process(tempGrid.data, this.state)
        // this.chRef.detectChanges();
      }, timer);
    }
  

  
    public setSelectableSettings(): void {
      this.selectableSettings = {
        checkboxOnly: this.checkboxOnly,
        mode: this.mode
      };
    }
  
    public onSelectedKeysChange(e) {
      const len = this.mySelection.length;
    }
  
   
    setSelectedRow(dataItem) {
      this.mySelection = [];
      this.selectedStages = [];
      this.mySelection.push(dataItem.wostagesurcde)
      this.selectedStages.push(dataItem)
    }
  
    

  openSearchBar() {
    let scrollTop = $('.layout-container').height();
    $('.search-container').show();
    $('.search-container').css('height', scrollTop);
    if ($('.search-container').hasClass('dismiss')) {
      $('.search-container').removeClass('dismiss').addClass('selectedcs').show();
    }
  }

  closeSearchBar() {
    if ($('.search-container').hasClass('selectedcs')) {
      $('.search-container').removeClass('selectedcs').addClass('dismiss');
      $('.search-container').animate({ width: 'toggle' });
    }
  }

  clearFilter() {
    this.status = "A";
    this.getMasterStages();
  } 

  filterTable(value, column) {
   if (column == "status")
   {
      this.status = value;
   }
   this.getMasterStages();
  }



  

  export() {
     if (this.masterStages.length != undefined && this.masterStages.length > 0) {
      let tempData = this.masterStages;
      let label = {
        'wostagedispseq': 'Sequence',
        'wostagename': 'Name',
        'wostagedesc': 'Description',
        'wostagestatus': 'Status',
        'createdBy': 'Created By',
        'mPgpA': 'Created',
        'updatedBy': 'Amended By',
        'mPgsA': 'Amended',
      } 

       this.helper.exportAsExcelFile(tempData, 'MasterStages', label)

     } else {
       alert('There is no record to import');
     } 
  }



  openEditStage(action, stage) {
    $('.disabledBackground').addClass('ovrlay');
    if (action=="new")
    {
      this.wopmMasterStagesModel = undefined;
    }
    else
    {
      this.wopmMasterStagesModel = new WopmMasterStageModel(stage.wostagesurcde, stage.wostagedispseq, stage.wostagename, stage.wostagedesc, stage.wostagestatus);
    }

    this.stageFormType = action;
    this.stageFormWindow = true;
}
  
  closeStageFormWin($event) {
    this.stageFormWindow = $event;
    $('.disabledBackground').removeClass('ovrlay');
    this.getMasterStages();
  }


  moveStage(action) {
    let isUp: boolean = (action == "up");
    if (this.mySelection.length > 0)
    {
        let id =this.mySelection[0];
        const stage = {
          ID: id,
          Up: isUp
        }
        this.wopmConfigurationService.moveMasterStage(stage)
        .subscribe(
          data => {
            if (data.isSuccess) {
              this.getMasterStages();
              }
          });

    }
  }


  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    if (columnIndex > 0) {
      if (this.touchtime == 0) {
        // set first click
        this.touchtime = new Date().getTime();
      } else {
        // compare first click to this click and see if they occurred within double click threshold
        if (((new Date().getTime()) - this.touchtime) < 400) {
          // double click occurred
          this.openEditStage("edit", dataItem);
          this.touchtime = 0;
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }
      }
    }
  }

}
  