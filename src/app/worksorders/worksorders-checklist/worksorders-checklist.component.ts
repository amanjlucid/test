import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation } from '@angular/core';
import { WopmConfigurationService, HelperService, AlertService, SharedService,ConfirmationDialogService, WorksorderManagementService } from '../../_services'
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SubSink } from 'subsink';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import { WopmTemplateModel, WopmChecklistModel} from '../../_models'
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-worksorders-checklist',
  templateUrl: './worksorders-checklist.component.html',
  styleUrls: ['./worksorders-checklist.component.css']
})


export class WorksordersChecklistComponent implements OnInit {
  @Input() showChecklistWindow: boolean = false;
  @Input() selectedWorksOrder;
  @Output() closeChecklistWindow = new EventEmitter<boolean>();
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
      logic: "and",
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


  constructor(
    private worksOrderService : WorksorderManagementService,
    private wopmConfigurationService: WopmConfigurationService,
    private alertService: AlertService,
    private helper: HelperService,
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
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
    this.getChecklist();
    this.sharedService.worksOrdersAccess.subscribe(data => {
      this.wopmPortalAccess = data;
    });
    this.workOrdersName = this.selectedWorksOrder.woname + " (Works Order No: " + this.selectedWorksOrder.wosequence.toString() + ")";
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public closeChecklistWin() {
    this.showChecklistWindow = false;
    this.closeChecklistWindow.emit(this.showChecklistWindow)
  }


  getChecklist(currentSelected: any = undefined) {
    this.subs.add(
      this.worksOrderService.getWorksOrderChecklist(this.selectedWorksOrder.wosequence).subscribe(
        data => {

          if (data && data.isSuccess) {
            let checklist = data.data;
            checklist.map(item => {
              item.mPgpA = new Date(item.mPgpA);
              item.mPgsA = new Date(item.mPgsA);
              item.wocheckstatus = (item.wocheckstatus == "A") ? "Active" :"Inactive";
              item.wocheckspeciaL2 = (item.wocheckspeciaL2 == "Y") ? "Yes" :(item.wocheckspeciaL2 == "N") ? "No":"";
              item.wocheckcost = '£' + item.wocheckcost.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            });

            this.checklistDetails = checklist;
            this.checklistDetailsTemp = Object.assign([], checklist);
            this.gridView = process(this.checklistDetailsTemp, this.state);
            if (currentSelected && this.mySelection.length > 0) {
              const isCurrentRecord = (element) => element.wotsequence == currentSelected.wotsequence && element.wochecksurcde == currentSelected.wochecksurcde;
              this.mySelection[0] = this.gridView.data.findIndex(isCurrentRecord);
            }
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


    exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
      if (this.checklistDetails && this.checklistDetails.length > 0) {
        let tempData = this.checklistDetails;
        //let ignore = ['assid','edeid','answerOnly','asctext','ascvalue','assid','ataid','chacode','eaarepairyear','eaascenarioanswercost','edccode','edcname','edcsequence','edeid','edqdatause','edqsequence','edqtype','enadate','enadescription','enasource','enatime','enauser','enscode','sapcode'];
        let ignore = [];
        let label = {
          'wostagename':'Stage',
          'wocheckname': 'Name',
          'wocheckstatus': 'Status',
          'wocheckspeciaL1': 'Checklist Type',
          'wocheckspeciaL2':'Attachment Required',
          'wocheckdesc':'Desc',
          'wocheckitemcomment': 'Comment',
          'wocheckresp': 'Responsibility',
          'wocheckcost': 'Cost',
          'woextrareF1':'Mail Merge Document',
          'woextrareF2': 'User Ref 2',
          'woextrareF3': 'User Ref 3',
          'woextrareF4': 'User Ref 4',
          'woextrareF5': 'User Ref 5',
          'createdby': 'Created By',
          'mPgqA': 'Created Date',
          'updatedby': 'Amended By',
          'mPgtA': 'Amended Date',
        }


        tempData.map(s => {
          s.mPgqA = (s.mPgqA != "") ? DateFormatPipe.prototype.transform(s.mPgqA, 'DD-MMM-YYYY') : s.mPgqA;
          s.mPgtA = (s.mPgtA != "") ? DateFormatPipe.prototype.transform(s.mPgtA, 'DD-MMM-YYYY') : s.mPgtA;
        });



        if (rowSelection != null) {
          if (this.mySelection.length != undefined && this.mySelection.length > 0) {
            let selectedRows = tempData.filter((v, k) => {
              return this.mySelection.includes(k)
            });
            this.selectedRows = selectedRows;
          } else {
            this.selectedRows = tempData;
          }
        } else {
          this.selectedRows = tempData;
        }


        this.helper.exportAsExcelFile(this.selectedRows, this.selectedWorksOrder.woname + '_Checklist', label)

      } else {
        this.alertService.error("There are no records to export.")
      }

    }

    checkWorksOrdersAccess(val: string): Boolean {
      if (this.worksOrderUsrAccess != undefined) {
      return this.worksOrderUsrAccess.includes(val);
      }
    }




    openEditChecklist (action, record) {

      $('.modalBGround').addClass('ovrlay');

      var textcost = record.wocheckcost;
      textcost = textcost.replace("£","").replace(",","");
      var numbercost: number = +textcost;
      this.wopmChecklistModel = new WopmChecklistModel(record.wosequence, record.wochecksurcde, record.wostagesurcde,
        record.wocheckdispseq, record.wocheckname, record.wocheckdesc, record.wostagename, record.wocheckstatus, record.wocheckitemcomment,
        record.wocheckresp, numbercost, record.woextrareF2, record.woextrareF3, record.woextrareF4, record.woextrareF5,
        record.wocheckspeciaL1, record.woextrareF1, record.wocheckspeciaL2);

      this.currentRow = record;
      this.editType = action;
      this.editchecklistWindow = true;
    }

    closechecklistFormWin(event) {
      this.editchecklistWindow = event;
      $('.modalBGround').removeClass('ovrlay');
      this.getChecklist();
    }

    moveStage(action) {
      if (this.mySelection.length > 0) {
        let selectedRow = this.gridView.data[this.mySelection[0]]
        let isUp: boolean = (action == "up");
        const stage = {
            wotsequence: selectedRow.wotsequence,
            wochecksurcde: selectedRow.wochecksurcde,
            wostagesurcde: selectedRow.wostagesurcde,
            Up: isUp
          }
          this.wopmConfigurationService.moveChecklistMaster(stage)
          .subscribe(
            data => {
              if (data.isSuccess) {
                this.getChecklist(stage);
                }
            });
      }
    }


    deleteChecklist(dataitem) {
      this.currentRow = dataitem;
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteChecklistConfirmed(confirmed) : console.log(confirmed))
      .catch(() => console.log('User dismissed the dialog.'));
    }

    deleteChecklistConfirmed(deleteConfirmed:boolean) {
      if (deleteConfirmed) {
        const checklist = {
          wotsequence: this.currentRow.wotsequence,
          wochecksurcde: this.currentRow.wochecksurcde,
          user: this.currentUser.userId
        }
        this.wopmConfigurationService.deleteChecklist(checklist)
        .subscribe(
          data => {
            if (data.isSuccess) {
                  this.alertService.success("Checklist item deleted successfully.")
                  this.getChecklist();
              }
          });
      }
    }

    public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
      this.currentRow = dataItem;
      if (columnIndex > 0) {
        if (this.touchtime == 0) {
          // set first click
          this.touchtime = new Date().getTime();
        } else {
          // compare first click to this click and see if they occurred within double click threshold
          if (((new Date().getTime()) - this.touchtime) < 400) {
            // double click occurred

            if (this.checkWorksOrdersAccess("Edit WO Checklist")){
              this.openEditChecklist ("edit", dataItem);
            }

            this.touchtime = 0;
          } else {
            // not a double click so set as a new first click
            this.touchtime = new Date().getTime();
          }
        }
      }
    }


}
