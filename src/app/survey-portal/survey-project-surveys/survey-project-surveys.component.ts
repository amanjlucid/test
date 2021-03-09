import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, LoaderService,  HelperService, SharedService, SurveyPortalService, AssetAttributeService } from '../../_services';
import { SubSink } from 'subsink';
import { ProjectSurveysListModel, SurveyPortalXports } from '../../_models';
import { DateFormatPipe } from '../../_pipes/date-format.pipe';
declare var $: any;

@Component({
  selector: 'app-survey-project-surveys',
  templateUrl: './survey-project-surveys.component.html',
  styleUrls: ['./survey-project-surveys.component.css']
})
export class SurveyProjectSurveysComponent implements OnInit {

  currentUser;
  //tabWindow = false;
  //tabName: string = "attributes";
  selectedProject;
  selectedProjectSurvey;
  projectSurveysLists: any = [];
  scrollLoad = true;
  securityFunctionAccess: any;
  InSurvey: boolean = false;
  projectSurveysListItem: ProjectSurveysListModel = {
    'OrderBy': 'Asset',
    'OrderType': 'Asc',
    'UserId': '',
    'SupCode': 'AAAAAWEB',
    'SupName': 'Webinar Survey Project',
    'StatusFilter': '',
    'AssetTypeFilter': '',
    'AssetFilter': '',
    'AddressFilter': '',
    'SrvCodeFilter': '',
    'SrvVersionFilter':  0,
    'InSurveysFilter': '',
    'PageNo': 0,

   }
    selectedProjectSurveysExport: any[] = [];
    subs = new SubSink(); // to unsubscribe services
    surveyProjectLabel: string;
    surveyBatchLabel: string;
    tabWindow = false;
    public openReports = false;
    public reportingAction = "";
    public selectedXport: SurveyPortalXports;
    params: string[];
    assetTypes: any;

  constructor(
    private loaderService: LoaderService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private helper: HelperService,
    private sharedService: SharedService,
    private surveyPortalService: SurveyPortalService,
    private assetAttributeService: AssetAttributeService,
    private chRef: ChangeDetectorRef,

  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit( ): void {
    this.loaderService.pageShow();
    this.subs.add(this.sharedService.surveyPortalSecurityList.subscribe(data => { this.securityFunctionAccess = data }));
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.projectSurveysListItem.UserId = this.currentUser.userId;
    this.selectedProject = JSON.parse(sessionStorage.getItem('SurvProj'));
    this.projectSurveysListItem.SupCode = this.selectedProject.SupCode;
    this.projectSurveysListItem.SupName = this.selectedProject.SupName;
    this.projectSurveysListItem.OrderBy = "Asset";
    this.projectSurveysListItem.OrderType = "Asc";
    this.getProjectSurveys(this.projectSurveysListItem);
    this.surveyProjectLabel = this.projectSurveysListItem.SupCode + ' - ' + this.projectSurveysListItem.SupName;
    this.getAssetTypes();
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
      this.projectSurveysListItem.PageNo = this.projectSurveysListItem.PageNo + 1;
      this.surveyPortalService.GetSurveyProjectsAssetsList(this.projectSurveysListItem).subscribe(
        data => {
            if (data.data.data.length != undefined && data.length > 0)
            {
              this.scrollLoad = true;
              let tempData = data.data;
              this.projectSurveysLists = this.projectSurveysLists.concat(tempData);
              this.projectSurveysLists.map(item => item.viewKey)
                .filter((value, index, self) => self.indexOf(value.viewKey) === index);
            }
        },
        error => {
          this.loaderService.hide();
        }
      )
    }

  }

  selectBackGround(parent, projectSurvey) {
    if (this.selectedProjectSurveysExport.find(x => x.viewKey == projectSurvey.viewKey) != undefined) {
      this.selectedProjectSurveysExport = this.selectedProjectSurveysExport.filter(x => x.viewKey == projectSurvey.viewKey);
      parent.style.backgroundColor = '';
    } else {
      parent.style.backgroundColor = '#cacaca';
      this.selectedProjectSurveysExport.push(projectSurvey);
    }

  }

  removeBack(parent, projectSurvey) {
    this.selectedProjectSurveysExport = [];
    var elems = document.querySelectorAll("tr");
    [].forEach.call(elems, function (el) {
      el.style.backgroundColor = '';
    });
    parent.style.backgroundColor = '#cacaca';
    this.selectedProjectSurveysExport.push(projectSurvey);
  }

  toggleClass(event: any, projectsurvey) {
    //this.sharedService.changeSelectedBatch(project);
    this.selectedProjectSurvey = projectsurvey
    const target = event.target;
    let parent = target.parentNode;

    if (event.target.tagName != "A") {
      if (event.target.tagName == "I") {
        parent = target.parentNode.parentNode.parentNode;
      }
      if (parent.tagName == "TR") {
        if (event.ctrlKey) {
          this.selectBackGround(parent, projectsurvey);
        } else {
          this.removeBack(parent, projectsurvey);
        }

      }
    }


  }

  getProjectSurveys(projectsList: ProjectSurveysListModel) {
    this.projectSurveysLists = [];
    this.surveyPortalService.GetSurveyProjectsAssetsList(projectsList).subscribe(
      data => {
        if(data.isSuccess)
        {
          if (data.data.length != undefined && data.data.length > 0)
          {
            this.scrollLoad = true;
            this.projectSurveysLists = data.data;
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

    if (column == 'Asset') {
      if (value.length >= 3)
      {
        this.projectSurveysListItem.AssetFilter = value;
      }
      else if (value.length > 0 && value.length < 3)
      {
        return false;
      }
    }
    if (column == 'Address') {
      if (value.length >= 3)
      {
        this.projectSurveysListItem.AddressFilter = value;
      }
      else if (value.length > 0 && value.length < 3)
      {
        return false;
      }
    }
    this.projectSurveysListItem.PageNo = 0;
    if (column == 'Status') {
      this.projectSurveysListItem.StatusFilter = value;
    }
    if (column == 'AssetType') {
      this.projectSurveysListItem.AssetTypeFilter = value;
    }
    if (column == 'SrvCode') {
      this.projectSurveysListItem.SrvCodeFilter = value;
    }
    if (column == 'SrvVersion') {
      if (value > 0) {
      this.projectSurveysListItem.SrvVersionFilter = value;
      }
      else {return false;}
    }
    if (column == 'InSurvey') {
      this.projectSurveysListItem.InSurveysFilter = (this.projectSurveysListItem.InSurveysFilter == 'N') ? '' : 'N';
    }


    this.getProjectSurveys(this.projectSurveysListItem);

  }

  clearTable() {
     $("#filterSearch").trigger("reset");
      this.scrollLoad = true;
      this.resetFilterList();

    this.getProjectSurveys(this.projectSurveysListItem);
  }

  orderBy(orderBy) {
    if (orderBy == this.projectSurveysListItem.OrderBy && this.projectSurveysListItem.OrderType == 'Asc') {
      this.projectSurveysListItem.OrderType = 'Desc';
    } else {
      this.projectSurveysListItem.OrderType = 'Asc';
    }
    this.projectSurveysListItem.OrderBy = orderBy;
    this.projectSurveysListItem.PageNo = 0;
    this.getProjectSurveys(this.projectSurveysListItem);
  }

  resetFilterList() {
    this.selectedProjectSurvey = [];
    this.projectSurveysListItem.StatusFilter = '';
    this.projectSurveysListItem.AssetTypeFilter = '';
    this.projectSurveysListItem.AssetFilter = '';
    this.projectSurveysListItem.AddressFilter = '';
    this.projectSurveysListItem.InSurveysFilter = '';
    this.projectSurveysListItem.SrvCodeFilter = '';
    this.projectSurveysListItem.SrvVersionFilter = 0;
    this.projectSurveysListItem.OrderBy = 'Asset';
    this.projectSurveysListItem.OrderType = 'Asc';
    this.projectSurveysListItem.PageNo = 0;

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
    let fileName = 'Surveys for Project - ' + this.projectSurveysListItem.SupName;
    let ignore = [];
    let label: any = {
      'inSurvey': 'In Survey',
      'asset': 'Asset',
      'address': 'Address',
      'assetType': 'Asset Type',
      'status': 'Status',
      'srvCode': 'Survey Code',
      'srvVersion': 'Version',
      'batchName': 'Batch',
      'surveyorID': 'Surveyor ID',

      }

      this.surveyPortalService.GetSurveyProjectsAssetsList(this.projectSurveysListItem).subscribe(
        data =>
        {
            if (data.data.length != undefined && data.data.length > 0)
            {
              let tempData = data.data;
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

  public openReport()  {
    $('.bgblur').addClass('ovrlay');
    this.openReports = true;

  }

 public closeReportingWin() {
    $('.bgblur').removeClass('ovrlay');
    this.openReports = false;
  }

  getAssetTypes() {
    this.assetAttributeService.getAssetTypes().subscribe(
      data => {
          if (data && data.isSuccess) {
          this.assetTypes = data.data;
        }
      },
      error => {
        this.loaderService.hide();
        //this.alertService.error(error);
      }
    )
  }

}

