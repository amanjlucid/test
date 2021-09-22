import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, LoaderService,  HelperService, SharedService, SurveyPortalService, AssetAttributeService } from '../../_services';
import { SubSink } from 'subsink';
import { BatchSurveysListModel, SurveyPortalXports } from '../../_models';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
import {formatDate} from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-survey-batch-surveys',
  templateUrl: './survey-batch-surveys.component.html',
  styleUrls: ['./survey-batch-surveys.component.css']
})
export class SurveyBatchSurveysComponent implements OnInit {

  currentUser;
  //tabWindow = false;
  //tabName: string = "attributes";
  selectedBatch;
  selectedBatchSurvey;
  selectedSurveyDate = formatDate(new Date(), '1900-01-01', 'en');
  todaysDate =  formatDate(new Date(), 'yyyy-MM-dd', 'en');
  batchSurveysLists: any = [];
  scrollLoad = true;
  canRunCBCReport = false;
  canRunPicturesReport = false;
  securityFunctionAccess: any;
  batchSurveysListItem: BatchSurveysListModel = {
    'OrderBy': 'SurveyName',
    'OrderType': 'Asc',
    'UserId': '',
    'SupCode': '',
    'SubID': 0,
    'SubArcID': 0,
    'StatusFilter': '',
    'SurveyBatchName': '',
    'SupName': '',
    'SurveyStartDateFilter': '',
    'SurveyEndDateFilter': '',
    'PageNo': 0,

   }
    title = 'Batch Surveys';
    filtersApplied = '';
    filterApplied = false;
    selectedBatchSurveysExport: any[] = [];
    subs = new SubSink(); // to unsubscribe services
    surveyProjectLabel: string;
    surveyBatchLabel: string;
    tabWindow = false;
    tabName: string = "batches surveys";
    public openReports = false;
    public reportingAction = "";
    public selectedXport: SurveyPortalXports;
    params: string[];
    tbodyHeight = "580px";
    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.updateGridHeight();
    }


  constructor(
    private loaderService: LoaderService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private helper: HelperService,
    private sharedService: SharedService,
    private surveyPortalService: SurveyPortalService,
    private assetAttributeService: AssetAttributeService,
    private chRef: ChangeDetectorRef,
    private router: Router,

  ) { }

  updateGridHeight() {
    const innerHeight = window.innerHeight;
    this.tbodyHeight = `${innerHeight - 330}px`;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit( ): void {
    this.loaderService.pageShow();
    this.updateGridHeight();
    
    this.subs.add(this.sharedService.surveyPortalSecurityList.subscribe(data => { this.securityFunctionAccess = data }));
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.selectedBatch = JSON.parse(sessionStorage.getItem('SurvBatch'));
    this.batchSurveysListItem.UserId = this.currentUser.userId;
    this.batchSurveysListItem.SupCode = this.selectedBatch.SupCode;
    this.batchSurveysListItem.SubID = this.selectedBatch.SubID;
    this.batchSurveysListItem.SubArcID = this.selectedBatch.SubArcID;
    this.batchSurveysListItem.SupName = this.selectedBatch.SupName;
    this.batchSurveysListItem.SurveyBatchName = this.selectedBatch.BatchName;
    this.getBatchSurveys(this.batchSurveysListItem);
    this.surveyProjectLabel = this.batchSurveysListItem.SupCode + ' - ' + this.batchSurveysListItem.SupName;
    this.surveyBatchLabel = this.batchSurveysListItem.SurveyBatchName
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
      this.batchSurveysListItem.PageNo = this.batchSurveysListItem.PageNo + 1;
      this.surveyPortalService.GetSurveyBatchesAssetsList(this.batchSurveysListItem).subscribe(
        data => {
            if (data.data.length != undefined && data.data.length > 0)
            {
              this.scrollLoad = true;
              let tempData = data.data;
              tempData.map(s => {
                s.surveyDate = (s.surveyDate != "") ? (s.surveyDate != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.surveyDate, 'DD-MMM-YYYY'): '' : s.surveyDate;
               });
              this.batchSurveysLists = this.batchSurveysLists.concat(tempData);
              this.batchSurveysLists.map(item => item.viewKey)
                .filter((value, index, self) => self.indexOf(value.viewKey) === index);
            }
        },
        error => {
          this.loaderService.hide();
        }
      )
    }

  }

  selectBackGround(parent, batchSurvey) {
    if (this.selectedBatchSurveysExport.find(x => x.viewKey == batchSurvey.viewKey) != undefined) {
      this.selectedBatchSurveysExport = this.selectedBatchSurveysExport.filter(x => x.viewKey == batchSurvey.viewKey);
      parent.style.backgroundColor = '';
    } else {
      parent.style.backgroundColor = '#cacaca';
      this.selectedBatchSurveysExport.push(batchSurvey);
    }

  }

  removeBack(parent, batchSurvey) {
    this.selectedBatchSurveysExport = [];
    var elems = document.querySelectorAll("tr");
    [].forEach.call(elems, function (el) {
      el.style.backgroundColor = '';
    });
    parent.style.backgroundColor = '#cacaca';
    this.selectedBatchSurveysExport.push(batchSurvey);
  }

  toggleClass(event: any, batchsurvey) {
    //this.sharedService.changeSelectedBatch(project);
    this.selectedBatchSurvey = batchsurvey

    if(this.selectedBatchSurvey.surveyCode == "ASBESTOS" && this.selectedBatchSurvey.status == "Complete" )
    {
        this.canRunCBCReport = true;
    }
    else
    {
      this.canRunCBCReport = false;
    }
    if(this.selectedBatchSurvey.pictureCount > 0 )
    {
        this.canRunPicturesReport = true;
    }
    else
    {
      this.canRunPicturesReport = false;
    }

    const target = event.target;
    let parent = target.parentNode;

    if (event.target.tagName != "A") {
      if (event.target.tagName == "I") {
        parent = target.parentNode.parentNode.parentNode;
      }
      if (parent.tagName == "TR") {
        if (event.ctrlKey) {
          this.selectBackGround(parent, batchsurvey);
        } else {
          this.removeBack(parent, batchsurvey);
        }
      }
    }
 }

  getBatchSurveys(batchesList: BatchSurveysListModel) {
    this.todaysDate;
    this.batchSurveysLists = [];
    this.surveyPortalService.GetSurveyBatchesAssetsList(batchesList).subscribe(
      data => {
        if(data.isSuccess)
        {
            if (data.data.length != undefined && data.data.length > 0)
            {
              this.scrollLoad = true;
              let tempData = data.data;
              tempData.map(s => {
                s.surveyDate = (s.surveyDate != "") ? (s.surveyDate != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.surveyDate, 'DD-MMM-YYYY'): '' : s.surveyDate;
                });
              this.batchSurveysLists = tempData;
              this.filtersApplied = this.batchSurveysLists[0].filtersApplied;
              this.checkRendertable();
            }
            else{
              if(this.filterApplied)
              {
                this.filtersApplied = "No records for this filter";
              };
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
     this.batchSurveysListItem.PageNo = 0;
    if (column == 'Status') {
      this.batchSurveysListItem.StatusFilter = value;
      this.filterApplied = true;
      this.getBatchSurveys(this.batchSurveysListItem);
    }
    if (column == 'StartDate') {
      if (value <= this.todaysDate)
      {
        if(value > "1900-01-01")
        {
          this.selectedSurveyDate = formatDate(new Date(), value, 'en');
          this.batchSurveysListItem.SurveyStartDateFilter = value;
        }
      }
      else
      {
        this.alertService.error('The survey start date cannot be in the future')
      }

    }
    if (column == 'EndDate') {
      this.batchSurveysListItem.SurveyEndDateFilter = value;
    }
    if (column == 'SurveyDate') {
      //validate the start and end dates here

      if(this.batchSurveysListItem.SurveyEndDateFilter >= this.batchSurveysListItem.SurveyStartDateFilter){
        this.filterApplied = true;
        this.getBatchSurveys(this.batchSurveysListItem);
      }
      else{
        this.alertService.error('The survey end date must be later than the start date')
      }
    }

  }

  clearTable() {
     $("#filterSearch").trigger("reset");
      this.scrollLoad = true;
      this.resetFilterList();

    this.getBatchSurveys(this.batchSurveysListItem);
  }

  orderBy(orderBy) {
    if (orderBy == this.batchSurveysListItem.OrderBy && this.batchSurveysListItem.OrderType == 'Asc') {
      this.batchSurveysListItem.OrderType = 'Desc';
    } else {
      this.batchSurveysListItem.OrderType = 'Asc';
    }
    this.batchSurveysListItem.OrderBy = orderBy;
    this.batchSurveysListItem.PageNo = 0;
    this.getBatchSurveys(this.batchSurveysListItem);
  }

  resetFilterList() {
    this.selectedBatchSurvey = [];
    this.batchSurveysListItem.StatusFilter = '';
    this.batchSurveysListItem.SurveyStartDateFilter = '';
    this.batchSurveysListItem.SurveyEndDateFilter = '';
    this.batchSurveysListItem.OrderBy = 'SurveyName';
    this.batchSurveysListItem.OrderType = 'Asc';
    this.batchSurveysListItem.PageNo = 0;
    this.selectedSurveyDate = '1900-01-01';
    this.filterApplied = false;
    this.filtersApplied = '';
  }

  openTabWindow(tabname, batchsurvey) {
   // $('.portalwBlurtab').addClass('ovrlay');
    this.selectedBatchSurvey = batchsurvey;
    this.tabName = tabname;
   // this.tabWindow = true;
    alert('Go to ' + tabname + ' Panel!');
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
    let fileName = 'Batches Surveys for Batch - ' + this.batchSurveysListItem.SurveyBatchName;
    let ignore = [];
    let label: any = {
      'supCode': 'Survey Project',
      'surveyCode': 'Survey Code',
      'surveyName': 'Survey Name',
      'version': 'Version',
      'asset': 'Asset',
      'address': 'Address',
      'surveyDate': 'Survey Date',
      'status': 'Status',
      'pictureCount': 'Picture Count',
      }

      this.surveyPortalService.GetSurveyBatchesAssetsList(this.batchSurveysListItem).subscribe(
        data =>
        {
            if (data.data.length != undefined && data.data.length > 0)
            {
              let tempData = data.data;
              tempData.map(s => {
                s.surveyDate = (s.surveyDate != "") ? (s.surveyDate != "1753-01-01T00:00:00") ? DateFormatPipe.prototype.transform(s.surveyDate, 'DD-MMM-YYYY'): '' : s.surveyDate;
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
    if (this.selectedBatchSurvey != undefined)
    {
      if(XportID == 0)
      {
        switch(this.selectedBatchSurvey.report)
        {
          case 'USER':
            XportID = 560;
            break;
          case 'USERCOM':
            XportID = 560;
            break;
          case 'HANDS':
            XportID = 562;
            break;
          case 'HANDSCOM':
            XportID = 562;
            break;
          case 'HHSRS':
            XportID = 566;
            break;
          case 'HHSRSCOM':
            XportID = 566;
            break;
          case 'ASB':
            XportID = 558;
            break;
          case 'ASBCOM':
            XportID = 558;
            break;
        }
        this.params = ['Project', this.selectedBatchSurvey.supCode, 'Batch', this.selectedBatchSurvey.subID, 'Asset', this.selectedBatchSurvey.asset];
      }
      else
      {
        this.params = ['Project', this.selectedBatchSurvey.supCode, 'Batch', this.selectedBatchSurvey.subID, 'Asset', this.selectedBatchSurvey.asset, 'Survey Code',this.selectedBatchSurvey.surveyCode,'Survey Code Version',this.selectedBatchSurvey.version];
      }

      this.selectedXport = {'XportID' : XportID,
      'ReportTitle':ReportTitle + ': ' + this.selectedBatchSurvey.surveyName,
      'Params': this.params,
      }
      this.reportingAction = 'runSurveyPortalXports';
      this.openReports = true;
    }
  }


public openPhotosReport() {

  if (this.selectedBatchSurvey != undefined)
  {
    let survey = this.selectedBatchSurvey;
    if (survey.pictureCount > 0)
    {
     //this.surveyPortalService.GetSurveyPicturesReport('001TEST', 1, 'AAAAAGPS',  'ASSET/01', 1, 'USERCOM').subscribe(
      this.surveyPortalService.GetSurveyPicturesReport(survey.supCode, survey.subID, survey.surveyCode,  survey.asset, survey.version, survey.report).subscribe(
          filedata => {
            let fileExt = "pdf";
            this.assetAttributeService.getMimeType(fileExt).subscribe(
              mimedata => {
                if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
                  var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
                    if (mimedata.data.openWindow)
                    {
                      var byteCharacters = atob(filedata);
                      var byteNumbers = new Array(byteCharacters.length);
                      for (var i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      var byteArray = new Uint8Array(byteNumbers);
                      var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                      var fileURL = URL.createObjectURL(file);
                      let newPdfWindow =window.open(fileURL);

                    }
                    else
                    {
                      linkSource = linkSource + filedata;
                      const downloadLink = document.createElement("a");
                      const fileName = 'Report';
                      downloadLink.href = linkSource;
                      downloadLink.download = fileName;
                      downloadLink.click();
                    }

                  }
                  else{
                    this.alertService.error("This file format is not supported.");
                  }
              }
            )
          },
          error => {
            this.alertService.error(error);
          }
        )
      }
    }
  }

  public openCBCReport(rowItem)  {
    if (this.selectedBatchSurvey != undefined)
    {
      let survey = this.selectedBatchSurvey;

      sessionStorage.removeItem('SurvAsset');
      let SurvAsset = {Assid: survey.asset, Address: survey.address, SurveyDate: survey.surveyDate, SamplesComplete: survey.samplesComplete};
      sessionStorage.setItem('SurvAsset', JSON.stringify(SurvAsset));
      this.router.navigate(['/surveying/cbcreport']);
    }

  }


 public closeReportingWin() {
    $('.bgblur').removeClass('ovrlay');
    this.openReports = false;
  }

}

