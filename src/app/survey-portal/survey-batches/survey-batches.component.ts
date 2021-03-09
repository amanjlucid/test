import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, LoaderService,  HelperService, SharedService, SurveyPortalService } from '../../_services';
import { SubSink } from 'subsink';
import { BatchesListModel, SurveyPortalXports } from '../../_models';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
declare var $: any;

@Component({
  selector: 'app-survey-batches',
  templateUrl: './survey-batches.component.html',
  styleUrls: ['./survey-batches.component.css']
})
export class SurveyBatchesComponent implements OnInit, OnDestroy {

  currentUser;
  selectedProject;
  //tabWindow = false;
  //tabName: string = "attributes";
  selectedBatch;
  batchesLists: any = [];
  scrollLoad = true;
  securityFunctionAccess: any;
  batchesListItem: BatchesListModel = {
    'OrderBy': 'SurveyBatch',
    'OrderType': 'Asc',
    'UserId': '',
    'SupCode': '',
    'SupName': '',
    'BatchNameFilter': '',
    'SurveyorNameFilter': '',
    'StatusFilter': '',
    'PageNo': 0,

   }
    selectedBatchesExport: any[] = [];
    subs = new SubSink(); // to unsubscribe services
    supCode: string;
    surveyBatch: string;
    tabWindow = false;
    tabName: string = "batches";
    SettingsApplied: boolean = false;
    public openReports = false;
    public reportingAction = "";
    public selectedXport: SurveyPortalXports;
    surveyProjectLabel: string;

  constructor(
    private loaderService: LoaderService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private helper: HelperService,
    private sharedService: SharedService,
    private surveyPortalService: SurveyPortalService,
    private chRef: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit( ): void {
    this.loaderService.pageShow();
    this.subs.add(this.sharedService.surveyPortalSecurityList.subscribe(data => { this.securityFunctionAccess = data }));
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.selectedProject = JSON.parse(sessionStorage.getItem('SurvProj'));
    if (sessionStorage.getItem('SurvBatchFilters'))
    {
      this.batchesListItem = JSON.parse(sessionStorage.getItem('SurvBatchFilters'));
    }
    else
    {
      this.batchesListItem.UserId = this.currentUser.userId;
      this.batchesListItem.SupCode = this.selectedProject.SupCode;
      this.batchesListItem.SupName = this.selectedProject.SupName;
    }
    this.getSurveyBatches(this.batchesListItem);
    this.surveyProjectLabel = this.batchesListItem.SupCode + ' - ' + this.batchesListItem.SupName;
  }

  onScroll(event)
  {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    const offsetHeight = event.target.offsetHeight;
    let scrollPosition = scrollTop + offsetHeight + 20;
    const scrollTreshold = scrollHeight;
    const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)

    if (isIEOrEdge) {
      scrollPosition = scrollPosition + 20;
    }

     if (scrollPosition > scrollTreshold && this.scrollLoad) {
      this.scrollLoad = false;
      this.batchesListItem.PageNo = this.batchesListItem.PageNo + 1;
      this.surveyPortalService.GetSurveyBatchesList(this.batchesListItem).subscribe(
        data => {
            if (data.data.length != undefined && data.data.length > 0)
            {
              this.scrollLoad = true;
              let tempData = data.data;
              tempData.map(s => {
                s.surveyDownloadDateTime = (s.surveyDownloadDateTime != "") ? (s.surveyDownloadDateTime != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.surveyDownloadDateTime, 'DD-MMM-YYYY HH:mm:SS'): '' : s.surveyDownloadDateTime;
                s.surveyUploadDateTime = (s.surveyUploadDateTime != "") ? (s.surveyUploadDateTime != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.surveyUploadDateTime, 'DD-MMM-YYYY HH:mm:SS'): '' : s.surveyUploadDateTime;
              });
              this.batchesLists = this.batchesLists.concat(tempData);
              this.batchesLists.map(item => item.viewKey)
              .filter((value, index, self) => self.indexOf(value.viewKey) === index);
            }
        },
        error => {
          this.loaderService.hide();
        }
      )
    }

  }

  selectBackGround(parent, batch) {
    if (this.selectedBatchesExport.find(x => x.viewKey == batch.viewKey) != undefined) {
      this.selectedBatchesExport = this.selectedBatchesExport.filter(x => x.viewKey == batch.viewKey);
      parent.style.backgroundColor = '';
    } else {
      parent.style.backgroundColor = '#cacaca';
      this.selectedBatchesExport.push(batch);
    }

  }

  removeBack(parent, batch) {
    this.selectedBatchesExport = [];
    var elems = document.querySelectorAll("tr");
    [].forEach.call(elems, function (el) {
      el.style.backgroundColor = '';
    });
    parent.style.backgroundColor = '#cacaca';
    this.selectedBatchesExport.push(batch);
  }

doubleclick(rowItem)
{
  if(this.checkGroupPermission('Survey Batch Asset'))
  {
    this.router.navigate(['/surveying/batchsurveys']);
  }
}

  toggleClass(event: any, batch) {
    //this.sharedService.changeSelectedBatch(project);
    this.selectedBatch = batch
    const target = event.target;
    let parent = target.parentNode;

    if (event.target.tagName != "A") {
      if (event.target.tagName == "I") {
        parent = target.parentNode.parentNode.parentNode;
      }
      if (parent.tagName == "TR") {
        if (event.ctrlKey) {
          this.selectBackGround(parent, batch);
        } else {
          this.removeBack(parent, batch);
        }

      }
    }

    sessionStorage.removeItem('SurvBatch');

    let SurvBatch = {SupCode: batch.supCode, SupName: batch.supName, BatchName: batch.surveyBatch, SubID: batch.subID, SubArcID: batch.subArcID};
    sessionStorage.setItem('SurvBatch', JSON.stringify(SurvBatch));

  }

  getSurveyBatches(batchesList: BatchesListModel) {
    this.batchesLists = [];
    this.surveyPortalService.GetSurveyBatchesList(batchesList).subscribe(
      data =>
      {
        if(data.isSuccess)
        {
            	if (data.data.length != undefined && data.data.length > 0)
            	{
                this.scrollLoad = true;
                let tempData = data.data;
                tempData.map(s => {
                  s.surveyDownloadDateTime = (s.surveyDownloadDateTime != "") ? (s.surveyDownloadDateTime != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.surveyDownloadDateTime, 'DD-MMM-YYYY HH:mm:SS'): '' : s.surveyDownloadDateTime;
                  s.surveyUploadDateTime = (s.surveyUploadDateTime != "") ? (s.surveyUploadDateTime != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.surveyUploadDateTime, 'DD-MMM-YYYY HH:mm:SS'): '' : s.surveyUploadDateTime;
                });
                this.batchesLists = tempData;
                this.checkRendertable();
            	}
            	this.loaderService.pageHide();
	      }
        else
        {
        this.alertService.error(data.message);
        this.loaderService.pageHide();
        }

      },
      error => {
        this.loaderService.hide();
        this.loaderService.pageHide();
      }
    )
  }

  filterTable(value, column) {
     this.batchesListItem.PageNo = 0;
    if (column == 'Status') {
      this.batchesListItem.StatusFilter = value;
    }
    if (column == 'SurveyBatch') {
      this.batchesListItem.BatchNameFilter = value;
    }
    if (column == 'SurveyorName') {
      this.batchesListItem.SurveyorNameFilter = value;
    }
    sessionStorage.setItem('SurvBatchFilters', JSON.stringify(this.batchesListItem));
    this.getSurveyBatches(this.batchesListItem);
  }

  clearTable() {
     $("#filterSearch").trigger("reset");
      this.scrollLoad = true;
      this.resetFilterList();
      sessionStorage.removeItem('SurvBatchFilters');
    this.getSurveyBatches(this.batchesListItem);
  }

  orderBy(orderBy) {
    if (orderBy == this.batchesListItem.OrderBy && this.batchesListItem.OrderType == 'Asc') {
      this.batchesListItem.OrderType = 'Desc';
    } else {
      this.batchesListItem.OrderType = 'Asc';
    }
    this.batchesListItem.OrderBy = orderBy;
    this.batchesListItem.PageNo = 0;
    this.getSurveyBatches(this.batchesListItem);
  }

  resetFilterList() {
    this.selectedBatch = [];
    this.batchesListItem.StatusFilter = '';
    this.batchesListItem.SurveyorNameFilter = '';
    this.batchesListItem.BatchNameFilter = '';
    this.batchesListItem.OrderBy = 'SurveyBatch';
    this.batchesListItem.OrderType = 'Asc';
    this.batchesListItem.PageNo = 0;

  }

  openTabWindow(tabname, batch) {
    switch(tabname)
    {
      case 'BatchSurveys':
        this.router.navigate(['/surveying/batchsurveys']);
        break;
    }
  }

  closeTabWindow($event) {
    this.tabWindow = $event;
    $('.portalwBlurtab').removeClass('ovrlay');

  }
  openSearchBar() {
    var scrollTop = $('.layout-container').height();
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

  exportToExcel(): void
  {
    let fileName = 'Survey Batches for Project - ' + this.batchesListItem.SupName;
    let ignore = [];
    let label: any = {
      'supCode': 'Survey Project',
      'surveyBatch': 'Survey Batch',
      'surveyorID': 'Surveyor ID',
      'surveyorName': 'Surveyor Name',
      'surveyDownloadDateTime': 'Survey Download Date Time',
      'surveyUploadDateTime': 'Survey Upload Date Time',
      'batchStatus': 'Batch Status',
      'exported': 'Exported',
      'complete ': 'Complete',
      'downloaded': 'Downloaded',
      'new': 'New',
      'active': 'Active',
      'subArcID': 'SubArcID',
      }

      this.surveyPortalService.GetSurveyBatchesList(this.batchesListItem).subscribe(
        data =>
        {
            if (data.data.length != undefined && data.data.length > 0)
            {
              let tempData = data.data;
              tempData.map(s => {
                s.surveyDownloadDateTime = (s.surveyDownloadDateTime != "") ? (s.surveyDownloadDateTime != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.surveyDownloadDateTime, 'DD-MMM-YYYY HH:mm:SS'): '' : s.surveyDownloadDateTime;
                s.surveyUploadDateTime = (s.surveyUploadDateTime != "") ? (s.surveyUploadDateTime != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.surveyUploadDateTime, 'DD-MMM-YYYY HH:mm:SS'): '' : s.surveyUploadDateTime;
              });
              this.helper.exportAsExcelFile(tempData, fileName, label)
            }
        }
      )

  }

  checkGroupPermission(val: string): Boolean {
    if (this.securityFunctionAccess != undefined) {
      return this.securityFunctionAccess.includes(val);
    }
  }

  trackByFunction(index, item) {
    return index;
  }

  checkRendertable() {
    let ua = window.navigator.userAgent;
    let IExplorerAgent = ua.indexOf("MSIE") > -1 || ua.indexOf("rv:") > -1;
    console.log(IExplorerAgent);
    // console.log(ua);
    if(!IExplorerAgent){
     setTimeout(() => {
       $('#batchesTbl').on('scroll', () => {
         $("#batchesTbl tbody").css({ 'overflow-y': 'hidden' });
         setTimeout(() => {
           $("#batchesTbl tbody").css({ 'overflow-y': 'scroll' });
         }, 1000);

         $("#batchesTbl > *").width($("#batchesTbl").width() + $("#batchesTbl").scrollLeft());
         this.chRef.markForCheck();
       });
     }, 5);
     this.chRef.markForCheck();
    } else {


     setTimeout(() => {
       $(".batchesGrid").css( "maxWidth", "100%" );
       $(".batchesGrid").css( { 'overflow-x': 'auto' } );
       $('#batchesTbl').on('scroll', () => {
         $("#batchesTbl tbody").css({ 'overflow-y': 'hidden' });
         setTimeout(() => {
           $("#batchesTbl tbody").css({ 'overflow-y': 'scroll' });
           this.chRef.markForCheck();
         }, 1000);


         $("#batchesTbl > *").width($("#batchesTbl").width() + $("#batchesTbl").scrollLeft());
         this.chRef.markForCheck();
       });
     }, 5);


    }

   }

  public openReport(XportID: number, ReportTitle: string)  {
    $('.bgblur').addClass('ovrlay');
    if (this.selectedBatch != undefined)
    {
      let params: string[] = ['Project', this.selectedBatch.supCode, 'Batch', this.selectedBatch.subID];
      this.selectedXport = {'XportID' : XportID,
      'ReportTitle':ReportTitle + ': ' + this.selectedBatch.supName,
      'Params': params,
      }
      this.reportingAction = 'runSurveyPortalXports';
      this.openReports = true;
    }
  }


 public closeReportingWin() {
    $('.bgblur').removeClass('ovrlay');
    this.openReports = false;
  }

}
