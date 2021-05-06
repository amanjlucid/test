import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, WopmConfigurationService } from '../../../_services'
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { WopmTemplateModel, SurveyPortalXports } from '../../../_models'

@Component({
  selector: 'app-wopm-templates',
  templateUrl: './wopm-templates.component.html',
  styleUrls: ['./wopm-templates.component.css']
})

export class WopmTemplatesComponent implements OnInit {
    subs = new SubSink();
    state: State = {
      skip: 0,
      sort: [],
      group: [],
      filter: {
        logic: "or",
        filters: []
      }
    }
  
    allowUnsort = true;
    multiple = false;
    public gridView: DataResult;
    pageSize = 25;
    templateDetails: any;
    templateDetailsTemp: any
    selectedTemplates: any = [];
    selectedTemplate: any;
    wopmTemplateModel: WopmTemplateModel
    touchtime = 0;
    public checkboxOnly = false;
    public mode: any = 'multiple';
    public mySelection: number[] = [];
    public selectableSettings: SelectableSettings;
    currentUser: any;
    editEvent: boolean = false;
    loading = true
    wopmSecurityList: any = [];
    public status: string = "A";
    public valid: string = "";
    public reportingAction: string;
    public templateFormWindow: boolean = false;
    public templateFormType: any;
    public dialogDeleteTemplate:boolean = false;
    public checklistWindow: boolean = false;
    public selectedXport: SurveyPortalXports;
    public openReports: boolean = false;
    public dependenciesWindow: boolean = false;
    public fileValue : any;
    
  
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
      this.getTemplateDetails();
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
                if (!(this.checkWorksOrdersAccess("Config Templates Tab") && this.checkWorksOrdersAccess("Works Order Portal Access"))) {
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
      return distinct(this.templateDetails, fieldName).map(item => {
        return { val: item[fieldName], text: item[fieldName] }
      });
    }
  
    getTemplateDetails() {
      this.subs.add(
        this.wopmConfigurationService.getWorksOrdersTemplateList(this.status, this.valid).subscribe(
          data => {
            if (data.isSuccess) {
              let templates = data.data;
              templates.map(item => {
                item.mPgpA = new Date(item.mPgpA);
                item.mPgsA = new Date(item.mPgsA);
                item.wotstatus = (item.wotstatus == "A") ? "Active" :"Inactive";
              });

              this.templateDetails = templates;
              this.templateDetailsTemp = Object.assign([], templates);
  
              // this.templateDetailsTemp = data.data.slice(this.state.skip, 30) // remove it
              // this.templateDetailsTemp =  Object.assign([], this.templateDetails);  // remove it
  
              this.gridView = process(this.templateDetailsTemp, this.state);
              this.loading = false;
  
  
            }
          }
        )
      )
    }
  
    public groupChange(groups: GroupDescriptor[]): void {
      this.state.group = groups;
      setTimeout(() => {
        this.gridView = process(this.templateDetailsTemp, this.state);
      }, 100);
    }
  
  
    public sortChange(sort: SortDescriptor[]): void {
      this.state.sort = sort;
      this.gridView = process(this.templateDetailsTemp, this.state);
    }
  
    public filterChange(filter: any): void {
      this.state.filter = filter;
      this.gridView = process(this.templateDetailsTemp, this.state);
  
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
  
   
    setSeletedRow(dataItem) {
      this.selectedTemplate = dataItem;
      this.mySelection = [];
      this.selectedTemplates = [];
      this.mySelection.push(dataItem.wotsequence)
      this.selectedTemplates.push(dataItem)
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
    this.valid = "";
    this.getTemplateDetails();
  } 

  filterTable(value, column) {
   if (column == "status")
   {
      this.status = value;
   }
   if (column == "valid")
   {
      this.valid = value;
   }
   this.getTemplateDetails();
  }



  

  export() {
     if (this.templateDetails.length != undefined && this.templateDetails.length > 0) {
      let tempData = this.templateDetails;
      let label = {
        'wotname': 'Name',
        'wotdesc': 'Description',
        'wottemplatetype': 'Type',
        'wotstatus': 'Status',
        'wotvalid': 'Template Valid',
        'createdby': 'Created By',
        'mPgpA': 'Created',
        'updatedby': 'Amended By',
        'mPgsA': 'Amended',
      } 

       this.helper.exportAsExcelFile(tempData, 'Templates', label)

     } else {
       alert('There is no record to import');
     } 
  }



  openEditTemplate(action, template) {
    $('.disabledBackground').addClass('ovrlay');
    if (action=="new")
    {
      this.wopmTemplateModel = undefined;
    }
    else
    {
      this.wopmTemplateModel = new WopmTemplateModel(template.wotsequence, template.wotname, template.wotdesc, template.wottemplatetype, template.wotstatus);
    }

    this.templateFormType = action;
    this.selectedTemplate = template;
    this.templateFormWindow = true;
  }

  closeTemplateFormWin($event) {
    this.templateFormWindow = $event;
    $('.disabledBackground').removeClass('ovrlay');
    this.getTemplateDetails();
  }


  openChecklistWindow(template) {
    $('.disabledBackground').addClass('ovrlay');
    this.wopmTemplateModel = new WopmTemplateModel(template.wotsequence, template.wotname, template.wotdesc, template.wottemplatetype, template.wotstatus);
    this.checklistWindow = true;
  }


  closeChecklistWindow($event) {
    this.checklistWindow = $event;
    $('.disabledBackground').removeClass('ovrlay');
    const template = {
      Sequence: this.wopmTemplateModel.sequence,
      UserId: this.currentUser.userId
    }
    this.wopmConfigurationService.validateTemplate(template)
    .subscribe(
      data => {
        if (data.isSuccess) {
          if (!data.data.isValid) {
            this.alertService.error(data.data.errorMessage)
          }
        }
      });
    this.getTemplateDetails();
  }


  copyTemplate(dataitem) {    
    const template = {
      Sequence: dataitem.wotsequence,
      Name: dataitem.wotname,
      Description: dataitem.wotdesc,
      UserId: this.currentUser.userId
    }

    this.wopmConfigurationService.copyTemplate(template)
      .subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Template copied successfully.")
            this.getTemplateDetails();
        }});
  }


  deleteTemplate(dataitem) { 
    this.selectedTemplate = dataitem;
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
    .then((confirmed) => (confirmed) ? this.deleteTemplateConfirmed(confirmed) : console.log(confirmed))
    .catch(() => console.log('User dismissed the dialog.'));
  }

  deleteTemplateConfirmed(deleteConfirmed:boolean) {
    if (deleteConfirmed) {
      const template = {
        Sequence: this.selectedTemplate.wotsequence,
        UserId: this.currentUser.userId
      }
      this.wopmConfigurationService.deleteTemplate(template)
      .subscribe(
        data => {
          if (data.isSuccess) {
            let deletionResult = data.data;
            if (deletionResult.status == "S") {
                this.alertService.success("Template deleted successfully.")
                this.getTemplateDetails();
              } else {
                this.alertService.error(deletionResult.message);
              }
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
          this.openChecklistWindow(dataItem);
          this.touchtime = 0;
        } else {
          // not a double click so set as a new first click
          this.touchtime = new Date().getTime();
        }
      }
     
    }
  }

  public exportTemplate(dataItem) {
    $('.disabledBackground').addClass('ovrlay');
    var params = ['Template', dataItem.wotsequence];
    this.selectedXport = {'XportID' : 556, 'ReportTitle':'Works Order Checklist Extract for Template : ' + dataItem.wotname, 'Params': params }
    this.reportingAction = 'runExportTemplate';
    this.openReports = true;
  }

  
  public closeReportingWin() {
    $('.disabledBackground').removeClass('ovrlay');
    this.openReports = false;
  }



  editDependenciesWindow(template) {
    $('.disabledBackground').addClass('ovrlay');
    this.wopmTemplateModel = new WopmTemplateModel(template.wotsequence, template.wotname, template.wotdesc, template.wottemplatetype, template.wotstatus);
    this.dependenciesWindow = true;
  }

s
  closeEditDependenciesWindow($event) {
    this.dependenciesWindow = $event;
    $('.disabledBackground').removeClass('ovrlay');

    this.getTemplateDetails();
  }

  openFile(){
    document.querySelector('input').click()
  }

  handleFile(e){
    var file = e.target.files[0]
    var fileExtension : string = file.name.slice(- 4);
    let reader = new FileReader();
    if (fileExtension.toLowerCase() == ".csv") {
        reader.onload = (function(user, service, alertService){
          return function(e) {
            var fileContent = reader.result;
            const template = {
              CSVText: fileContent,
              User: user
            }
      
            service.TemplateInterface(template)
            .subscribe(
              data => {
                if (data.isSuccess) {
                  alertService.success(data.data);
                } else {
                  alertService.error(data.message);
                }
              },
              error => {
                alertService.error(error);
                this.loading = false;
              }
            );
          };
        })(this.currentUser.userId,this.wopmConfigurationService, this.alertService)

        reader.onerror = function() {
          console.log(reader.error);
        };
        reader.readAsText(file);

      } else {
        this.alertService.error("The Template interface file must be a csv file.");
      }

   this.fileValue =null;
  }

}
  