import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import {  AlertService, WorksorderManagementService } from '../../_services';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-completion-list',
    templateUrl: './completion-list.component.html',
    styleUrls: ['./completion-list.component.css']
})

export class CompletionListComponent implements OnInit, OnChanges, OnDestroy {  

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
  disableBtn : boolean = true;
  selectedCompletionsList: any;

  @ViewChild(GridComponent) grid: GridComponent;
  
  @Input() completionWin: boolean = false;
  @Output() closeCompletionWin = new EventEmitter<boolean>();

  @Input() workOrderId: number;

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    console.log(changes);
    if(this.completionWin){
       this.getWorkOrderGetWorksOrderCompletionsList();
    }
  }

  ngOnInit() {
    this.getWorkOrderGetWorksOrderCompletionsList();
  }

  ngOnDestroy() {
    //console.log("Destroy");
    if(this.completionWin == true){
      this.closeCompletionWindow();
    }
    this.subs.unsubscribe();
  }

  constructor(
    private workOrderProgrammeService: WorksorderManagementService,
    private alertService: AlertService,
    private chRef: ChangeDetectorRef
) {
    
  }

  public mySelectionKey(context: RowArgs) {
    return context.dataItem.wocosequence;
  }

  public closeCompletionWindow() {
    this.disableBtn = true;
    this.mySelection = [];
    this.completionWin = false;
    this.closeCompletionWin.emit(this.completionWin);
    $('.bgblur').removeClass('ovrlay');
  }

  getWorkOrderGetWorksOrderCompletionsList() {
    this.subs.add(
      this.workOrderProgrammeService.GetWorkOrderGetWorksOrderCompletions(this.workOrderId, this.currentUser.userId)
        .subscribe(
          data => {     
            if (data && data.isSuccess) {
              let tempData = data.data;
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

  getSelectedCell({dataItem, type}){
    if(type == "click" && dataItem != ""){
      this.disableBtn = false;
      this.selectedCompletionsList = dataItem;
      this.mySelection = [dataItem.wosequence, dataItem.wocosequence];
    }
  }

  viewWorkOrderCompletionsReport(wosequence, wocosequence, userId) {
    this.subs.add(
      this.workOrderProgrammeService.viewWorkOrderCompletionCertificate(wosequence, wocosequence, userId).subscribe(
          data => {        
            if (data && data.isSuccess) {
              let tempData = data.data;
              let tempMessage = data.message;
              let filename = wosequence + '_' +wocosequence + '_Report';
              this.downloadPdf(tempData, filename);
              this.alertService.success("Completion Report Downloaded.");
            }else{
              this.alertService.error(data.message);
            }
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

  previewCompletionReport(){
    this.viewWorkOrderCompletionsReport(this.selectedCompletionsList.wosequence, this.selectedCompletionsList.wocosequence, this.currentUser.userId);
  }

  saveSendCompletionReport(){
    this.subs.add(
      this.workOrderProgrammeService.saveSendWorkOrderCompletionCertificate(this.selectedCompletionsList.wosequence, this.selectedCompletionsList.wocosequence, this.currentUser.userId).subscribe(
          data => {        
            if (data && data.isSuccess) {
              let tempMessage = data.message;
              this.alertService.success("Completion Report Successfully Saved.");
            }else{
              this.alertService.error(data.message);
            }
          }
        )
    )
  }
  
}
