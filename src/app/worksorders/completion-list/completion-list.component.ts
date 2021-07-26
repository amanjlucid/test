import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { AlertService, HelperService, SharedService, WorksorderManagementService } from '../../_services';
import { SubSink } from 'subsink';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'app-completion-list',
  templateUrl: './completion-list.component.html',
  styleUrls: ['./completion-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CompletionListComponent implements OnInit, OnDestroy {

  workOrderProgrammeData;
  subs = new SubSink(); // to unsubscribe services
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public gridView: DataResult;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  };
  groups: GroupDescriptor[] = [];
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  public allowUnsort = true;
  public multiple = false;
  public windowState = 'default';
  public windowTop = '15';
  disableBtn: boolean = true;
  selectedCompletionsList: any;
  @ViewChild(GridComponent) grid: GridComponent;

  @Input() completionWin: boolean = false;
  @Output() closeCompletionWin = new EventEmitter<boolean>();
  @Input() worksOrderData: any;

  title = '';
  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  SendEmailInsReportWindow = false;



  constructor(
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private helperService : HelperService
  ) { }


  ngOnInit() {

    let woname = this.worksOrderData.woname || this.worksOrderData.name
    this.title = `Completions: ${this.worksOrderData?.wosequence} - ${woname}`

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

    this.getWorkOrderGetWorksOrderCompletionsList();

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }



  public mySelectionKey(context: RowArgs) {
    return context.dataItem.wocosequence;
  }

  public closeCompletionWindow() {
    this.disableBtn = true;
    this.mySelection = [];
    this.completionWin = false;
    this.closeCompletionWin.emit(this.completionWin);
  }

  getWorkOrderGetWorksOrderCompletionsList() {
    this.subs.add(
      this.workOrderProgrammeService.GetWorkOrderGetWorksOrderCompletions(this.worksOrderData.wosequence, this.currentUser.userId)
        .subscribe(
          data => {
            if (data && data.isSuccess) {
              let tempData = data.data;
              tempData.map(s => {
                s.wocodate = new Date(s.wocodate);
               });
              this.workOrderProgrammeData = tempData;
              this.gridView = process(this.workOrderProgrammeData, this.state);
              this.chRef.detectChanges();
            }
          }
        )
    )
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.workOrderProgrammeData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.workOrderProgrammeData, this.state);

  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.workOrderProgrammeData, this.state);
  }

  getSelectedCell({ dataItem, type }) {
    if (type == "click" && dataItem != "") {
      this.disableBtn = false;
      this.selectedCompletionsList = dataItem;
      this.mySelection = [dataItem.wosequence, dataItem.wocosequence];
    }
  }

  viewWorkOrderCompletionsReport(wosequence, wocosequence, userId) {
    this.alertService.success("Generating Report Please Wait...")

    this.subs.add(
      this.workOrderProgrammeService.viewWorkOrderCompletionCertificate(wosequence, wocosequence, userId).subscribe(
        data => {
          if (data && data.isSuccess) {
            let tempData = data.data;
            // let tempMessage = data.message;
            let filename = wosequence + '_' + wocosequence + '_Report';
            this.downloadPdf(tempData, filename);
          } else {
            this.alertService.error(data.message);
          }

          this.chRef.detectChanges();
        }
      )
    )
  }

  downloadPdf(base64String, fileName) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.pdf`
    link.click();
  }

  previewCompletionReport(item) {
    const { wosequence, wocosequence } = item;
    this.viewWorkOrderCompletionsReport(wosequence, wocosequence, this.currentUser.userId);
  }




  woMenuAccess(menuName) {
    return this.helperService.checkWorkOrderAreaAccess(this.worksOrderUsrAccess, menuName)
  }

  openEmailInstructionReport(item) {
    $('.completionListOverlay').addClass('ovrlay');
    this.selectedCompletionsList = item;
    this.SendEmailInsReportWindow = true;

  }


  closeEmailWithReportWindow(eve) {
    this.SendEmailInsReportWindow = false;
    $('.completionListOverlay').removeClass('ovrlay');

  }



}
