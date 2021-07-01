import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { WopmConfigurationService, HelperService, AlertService, SharedService,ConfirmationDialogService, WorksorderManagementService } from '../../_services'
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { WopmTemplateModel, WopmChecklistModel} from '../../_models'
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-customer-survey',
  templateUrl: './customer-survey.component.html',
  styleUrls: ['./customer-survey.component.css']
})


export class CustomerSurveyComponent implements OnInit {
  @Input() showCustomerSurveyWindow;
  @Input() selectedWorksOrderAsset;
  @Output() closeCustomerSurveyWindow = new EventEmitter<boolean>();
  workOrdersName : string;
  public selectedRows: any[] = [];
  wopmPortalAccess = [];
  subs = new SubSink(); // to unsubscribe services
  checklistTableData;
  loading: boolean = true;
  public mySelection: number[] = [];
  public gridView: DataResult;
  pageSize = 25;
  checklistDetails: any;
  checklistDetailsTemp: any;
  public wopmChecklistModel : WopmChecklistModel
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  currentRow: any;
  editType: any;
  editchecklistWindow: boolean = false;
  public dialogDeleteChecklist:boolean = false;
  currentUser;
  touchtime = 0;
  wopmTemplateModel : WopmTemplateModel
  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];
  questions: any = [];


  constructor(
    private worksOrderService : WorksorderManagementService,
    private wopmConfigurationService: WopmConfigurationService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.subs.add(
      combineLatest([
        this.sharedService.worksOrdersAccess,
        this.sharedService.woUserSecObs,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          this.worksOrderAccess = data[0];
          this.worksOrderUsrAccess = data[1];
          this.userType = data[2][0];
        }
      )
    )
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getCustomerSurvey();
    this.sharedService.worksOrdersAccess.subscribe(data => { 
      this.wopmPortalAccess = data;
    });
    //this.workOrdersName = this.selectedWorksOrderAsset.woname + " (Works Order No: " + this.selectedWorksOrder.wosequence.toString() + ")";
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public closeWindow() {
    this.showCustomerSurveyWindow = false;
    this.closeCustomerSurveyWindow.emit(this.showCustomerSurveyWindow)
  }

  trackByFunction(index, item) {
    return index;
  }
  
  getCustomerSurvey(currentSelected: any = undefined) {
    this.subs.add(
      this.worksOrderService.getCustomerSurveyAnswers(this.selectedWorksOrderAsset.wosequence, this.selectedWorksOrderAsset.wopsequence, 
        this.selectedWorksOrderAsset.assid).subscribe(
        data => {

          if (data && data.isSuccess) {
            this.questions = data.data;
            this.chRef.detectChanges();
            this.loading = false;

          }
          
        }
      ))
  }


  
  getYear(initialDate){
    var properDate = new Date(initialDate);
    var yearValue = properDate.getFullYear();
    return yearValue;
    }

    checkWorksOrdersAccess(val: string): Boolean {
      if (this.worksOrderUsrAccess != undefined) {
      return this.worksOrderUsrAccess.includes(val);
      }
    }

    applySurvey() {

      let missingQuestions = [];
      this.questions.forEach((item) => {

        switch(item.wocstquestiontype) { 
          case "YESNO": { 
            if (item.woacsrnumericanswer == 0) {
              item.hasAnswer = false;
              missingQuestions.push(item.wocstquestionsequence);
            }
             break; 
          } 
          case "MULTI": { 
            if (item.woacsrnumericanswer == 0) {
              item.hasAnswer = false;
              missingQuestions.push(item.wocstquestionsequence);
            }
             break; 
          } 
          case "TEXTUAL": { 
            if (!item.woacsrtextualanswer) {
              item.hasAnswer = false;
              missingQuestions.push(item.wocstquestionsequence);
            }
            // WOACSRTEXTUALANSWER
             break; 
          } 
          default: { 

             break; 
          } 
      }

    });
    if (missingQuestions.length === 0) {
      const updateParm = {
        Answers : this.questions,
        user : this.currentUser.userId,
      }

      this.worksOrderService.updateCustomerSurvey(updateParm).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.alertService.success("Customer Survey updated successfully.");
            this.closeWindow()
          } else {
            this.alertService.error(data.message);
          }
        },
        error => {
          this.alertService.error(error);
        }
      )

    } else {
      let messageString = "Answers to the following questions are missing: " + missingQuestions.join(",");
      this.alertService.error(messageString);
    }
    }


}
