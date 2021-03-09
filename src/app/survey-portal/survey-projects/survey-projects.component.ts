import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, LoaderService,  HelperService, SharedService, SurveyPortalService } from '../../_services';
import { SubSink } from 'subsink';
import { ProjectsListModel, SurveyPortalXports } from '../../_models';

declare var $: any;

@Component({
  selector: 'app-survey-projects',
  templateUrl: './survey-projects.component.html',
  styleUrls: ['./survey-projects.component.css']
})
export class SurveyProjectsComponent implements OnInit, OnDestroy {

  currentUser;
  //tabWindow = false;
  //tabName: string = "attributes";
  selectedProject;
  projectsLists: any = [];
  scrollLoad = true;
  securityFunctionAccess: any;
  projectsListItem: ProjectsListModel = {
    'UserId': '',
    'OrderBy': 'SupCode',
    'OrderType': 'Asc',
    'SupCode': '',
    'SupName': '',
    'StatusFilter': 'Active',
    'SupCodeNameFilter': '',
    'SettingsFilter': '',
    'PageNo': 0,

   }
    selectedProjectsExport: any[] = [];
    previousFilters;
    subs = new SubSink(); // to unsubscribe services
    supCode: string;
    tabWindow = false;
    tabName: string = "projects";
    SettingsApplied: boolean = false;
    public openReports = false;
    public SurveyBatchMenuIsActive = false;
    public SurveyAssetMenuIsActive = false;
    public reportingAction = "";
    public selectedXport: SurveyPortalXports;

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
    if (sessionStorage.getItem('SurvProjFilters'))
    {
      this.projectsListItem = JSON.parse(sessionStorage.getItem('SurvProjFilters'));
    }
    else
    {
      this.projectsListItem.UserId = this.currentUser.userId;
      this.projectsListItem.StatusFilter = "Active";
    }
    this.getSurveyProjects(this.projectsListItem);

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
      this.projectsListItem.PageNo = this.projectsListItem.PageNo + 1;
      this.surveyPortalService.GetSurveyProjectsList(this.projectsListItem).subscribe(
        data => {
          if (data.data.isSuccess) {
            if (data.data.length != undefined && data.data.length > 0)
            {
              this.scrollLoad = true;
              let tempData = data.data;
              this.projectsLists = this.projectsLists.concat(tempData);
              this.projectsLists.map(item => item.SupCode)
                .filter((value, index, self) => self.indexOf(value.SupCode) === index);
            }
          }
          else
          {
            this.loaderService.hide();
          }
        },
        error => {
          this.loaderService.hide();
        }
      )
    }

  }

  selectBackGround(parent, project) {
    if (this.selectedProjectsExport.find(x => x.SupCode == project.SupCode) != undefined) {
      this.selectedProjectsExport = this.selectedProjectsExport.filter(x => x.SupCode == project.SupCode);
      parent.style.backgroundColor = '';
    } else {
      parent.style.backgroundColor = '#cacaca';
      this.selectedProjectsExport.push(project);
    }

  }

  removeBack(parent, project) {
    this.selectedProjectsExport = [];
    var elems = document.querySelectorAll("tr");
    [].forEach.call(elems, function (el) {
      el.style.backgroundColor = '';
    });
    parent.style.backgroundColor = '#cacaca';
    this.selectedProjectsExport.push(project);
  }

  doubleclick(rowItem)
  {
    if(this.checkGroupPermission('Survey Batches'))
    {
      this.router.navigate(['/surveying/batches']);
    }

  }



  toggleClass(event: any, project) {
    //this.sharedService.changeSelectedproject(project);


    this.selectedProject = project
    const target = event.target;
    let parent = target.parentNode;

    if (event.target.tagName != "A") {
      if (event.target.tagName == "I") {
        parent = target.parentNode.parentNode.parentNode;
      }
      if (parent.tagName == "TR") {
        if (event.ctrlKey) {
          this.selectBackGround(parent, project);
        } else {
          this.removeBack(parent, project);
        }
      }
    }

    sessionStorage.removeItem('SurvProj');
    sessionStorage.removeItem('SurvBatch');
    sessionStorage.removeItem('SurvBatchFilters');
    sessionStorage.removeItem('SurvProjFilters');
    let SupProj = {SupCode: project.supCode, SupName: project.supName};
    sessionStorage.setItem('SurvProj', JSON.stringify(SupProj));
    this.SurveyBatchMenuIsActive = true;
    this.SurveyAssetMenuIsActive = false;

  }

  getSurveyProjects(projectsList: ProjectsListModel) {
    this.projectsLists = [];
    this.surveyPortalService.GetSurveyProjectsList(projectsList).subscribe(
      data => {
        if (data.isSuccess)
        {
          if (data.data.length != undefined && data.data.length > 0)
          {
            this.scrollLoad = true;
            let tempData = data.data;
            this.projectsLists = tempData;
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
     this.projectsListItem.PageNo = 0;
    if (column == 'Status') {
      this.projectsListItem.StatusFilter = value;
    }
    if (column == 'SupCode') {
      this.projectsListItem.SupCodeNameFilter = value;
    }
    if (column == 'Settings') {
      this.projectsListItem.SettingsFilter = (this.projectsListItem.SettingsFilter == 'Y') ? '' : 'Y';
    }
    sessionStorage.setItem('SurvProjFilters', JSON.stringify(this.projectsListItem));
    this.getSurveyProjects(this.projectsListItem);
  }

  clearFilterTable() {
     $("#filterSearch").trigger("reset");
      this.scrollLoad = true;
      this.resetFilterList();
      sessionStorage.removeItem('SurvProjFilters');
    this.getSurveyProjects(this.projectsListItem);
  }

  orderBy(orderBy) {
    if (orderBy == this.projectsListItem.OrderBy && this.projectsListItem.OrderType == 'Asc') {
      this.projectsListItem.OrderType = 'Desc';
    } else {
      this.projectsListItem.OrderType = 'Asc';
    }
    this.projectsListItem.OrderBy = orderBy;
    this.projectsListItem.PageNo = 0;
    this.getSurveyProjects(this.projectsListItem);
  }

  resetFilterList() {
    this.selectedProject = [];
    this.projectsListItem.StatusFilter = 'Active';
    this.projectsListItem.SupCodeNameFilter = '';
    this.projectsListItem.SettingsFilter = ''
    this.projectsListItem.OrderBy = 'SupCode';
    this.projectsListItem.OrderType = 'Asc';
    this.projectsListItem.PageNo = 0;

  }

  openTabWindow(tabname, project) {
    switch(tabname)
    {
      case 'Batches':
        this.router.navigate(['/surveying/batches']);
        break;
      case 'ProjectSurveys':
        this.router.navigate(['/surveying/projectsurveys']);
        break;
      case 'ProjectAccess':
        this.router.navigate(['/surveying/projectaccess']);
        break;
      break;
      case 'Settings':
        this.router.navigate(['/surveying/projectsettings']);
        break;
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
    let fileName = 'Survey-Projects.xlsx' ;
    let ignore = [];
    let label: any = {
      'supCode': 'Survey Project',
      'supName': 'Name',
      'supStatus': 'Status',
      'newSurveys': 'New Surveys',
      'activeSurveys': 'Ative Surveys',
      'assignedSurveys': 'Assigned Surveys',
      'completedSurveys': 'Completed Surveys',
      'downloadedSurveys': 'Downloaded Surveys',
      'exportedSurveys': 'Exported Surveys',
      'pendingSurveys': 'Pending Surveys',
      'surveyBatches': 'Survey Batches',
      'settingsExist': 'Project Settings',
      }

      this.surveyPortalService.GetSurveyProjectsList(this.projectsListItem).subscribe(
        data =>
        {
          if(data.isSuccess)
          {
            if (data.data.length != undefined && data.data.length > 0)
            {
              this.helper.exportAsExcelFile(data.data, 'Survey-Projects', label)
            }
            this.loaderService.pageHide();
          }
          else
          {
            this.loaderService.pageHide();
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
       $('#projectsTbl').on('scroll', () => {
         $("#projectsTbl tbody").css({ 'overflow-y': 'hidden' });
         setTimeout(() => {
           $("#projectsTbl tbody").css({ 'overflow-y': 'scroll' });
         }, 1000);

         $("#projectsTbl > *").width($("#projectsTbl").width() + $("#projectsTbl").scrollLeft());
         this.chRef.markForCheck();
       });
     }, 5);
     this.chRef.markForCheck();
    } else {


     setTimeout(() => {
       $(".projectsGrid").css( "maxWidth", "100%" );
       $(".projectsGrid").css( { 'overflow-x': 'auto' } );
       $('#projectsTbl').on('scroll', () => {
         $("#projectsTbl tbody").css({ 'overflow-y': 'hidden' });
         setTimeout(() => {
           $("#projectsTbl tbody").css({ 'overflow-y': 'scroll' });
           this.chRef.markForCheck();
         }, 1000);


         $("#projectsTbl > *").width($("#projectsTbl").width() + $("#projectsTbl").scrollLeft());
         this.chRef.markForCheck();
       });
     }, 5);


    }

   }

  public openReport(XportID: number, ReportTitle: string)  {
    $('.bgblur').addClass('ovrlay');
    if (this.selectedProject != undefined)
    {
      let params: string[] = ['Project', this.selectedProject.supCode];
      this.selectedXport = {'XportID' : XportID,
      'ReportTitle':ReportTitle + ': ' + this.selectedProject.supName,
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
