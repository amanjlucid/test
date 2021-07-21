import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, LoaderService,  HelperService, SharedService, SurveyPortalService} from '../../_services';
import { SubSink } from 'subsink';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { SurveyProjectAccessModel } from '../../_models';

declare var $: any;

@Component({
  selector: 'app-survey-project-access',
  templateUrl: './survey-project-access.component.html',
  styleUrls: ['./survey-project-access.component.css']
})
export class SurveyProjectAccessComponent implements OnInit, OnDestroy {

  currentUser;
  selectedProject;
  surveyProjectLabel: string;
  selectedProjectName: string;
  selectedProjectAccess;
  projectAccessItemLists: any = [];
  filtersApplied = '';
  filterApplied = false;
  HasAccess: boolean = false;
  scrollLoad = true;
  securityFunctionAccess: any;
  surveyProjectAccessItem: SurveyProjectAccessModel = {
    'OrderBy': 'UserID',
    'OrderType': 'Asc',
    'SupCode' : '',
    'HasAccess' : '',
    'UserID' : '',
    'UserName' : '',
    'UserStatus' : '',
    'UserEmail' : '',
    'ConCode' : '',
    'ConName' : '',
    'LoginAllowed' : '',
    PageNo:  0,

   }
    selectedAccessItem: any[] = [];
    subs = new SubSink(); // to unsubscribe services
    userNameSearch$ = new Subject<any>();
    emailSearch$ = new Subject<any>();
    conNameSearch$ = new Subject<any>();


  constructor(
    private loaderService: LoaderService,
    private alertService: AlertService,
    private sharedService: SharedService,
    private surveyPortalService: SurveyPortalService,
    private chRef: ChangeDetectorRef,
    private router: Router,

  ) {


  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit( ): void {
    this.loaderService.pageShow();
    this.subs.add(this.sharedService.surveyPortalSecurityList.subscribe(data => { this.securityFunctionAccess = data }));
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.surveyProjectAccessItem.UserID = this.currentUser.userId;
    this.selectedProject = JSON.parse(sessionStorage.getItem('SurvProj'));
    this.surveyProjectAccessItem.SupCode = this.selectedProject.SupCode;
    this.surveyProjectAccessItem.OrderBy = "UserID";
    this.surveyProjectAccessItem.OrderType = "Asc";
    this.getProjectAccessList(this.surveyProjectAccessItem);
    this.surveyProjectLabel = this.selectedProject.SupCode + ' - ' + this.selectedProject.SupName;
    sessionStorage.setItem('SurveyAccess', 'SurveyAccess');
    this.subs.add(
      this.userNameSearch$
        .pipe(
          debounceTime(1000),
          distinctUntilChanged()
        ).subscribe((val) => {
          this.filterTable(val, 'UserID');
        })
    );

    this.subs.add(
      this.emailSearch$
        .pipe(
          debounceTime(1000),
          distinctUntilChanged()
        ).subscribe((val) => {
          this.filterTable(val, 'UserEmail');
        })
    );

    this.subs.add(
      this.conNameSearch$
        .pipe(
          debounceTime(1000),
          distinctUntilChanged()
        ).subscribe((val) => {
          this.filterTable(val, 'ConName');
        })
    );
  }

  triggerUserNameSearch(value) {
    this.userNameSearch$.next(value);
  }

  triggerEmailSearch(value) {
    this.emailSearch$.next(value);
  }

  triggerConNameSearch(value) {
    this.conNameSearch$.next(value);
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
      this.surveyProjectAccessItem.PageNo = this.surveyProjectAccessItem.PageNo + 1;
      this.surveyPortalService.GetSurveyProjectAccessList(this.surveyProjectAccessItem).subscribe(
        data => {
            if (data.data.length != undefined && data.data.length > 0)
            {
              this.scrollLoad = true;
              let tempData = data.data;
              this.projectAccessItemLists = this.projectAccessItemLists.concat(tempData);
              this.projectAccessItemLists.map(item => item.UserID)
                .filter((value, index, self) => self.indexOf(value.UserID) === index);
            }
        },
        error => {
          this.loaderService.hide();
        }
      )
    }

  }

  selectBackGround(parent, projectAccess) {
    if (this.selectedAccessItem.find(x => x.UserID == projectAccess.UserID) != undefined) {
      this.selectedAccessItem = this.selectedAccessItem.filter(x => x.UserID == projectAccess.UserID);
      parent.style.backgroundColor = '';
    } else {
      parent.style.backgroundColor = '#cacaca';
      this.selectedAccessItem.push(projectAccess);
    }

  }

  removeBack(parent, projectAccess) {
    this.selectedAccessItem = [];
    var elems = document.querySelectorAll("tr");
    [].forEach.call(elems, function (el) {
      el.style.backgroundColor = '';
    });
    parent.style.backgroundColor = '#cacaca';
    this.selectedAccessItem.push(projectAccess);
  }

  toggleClass(event: any, projectaccess) {
    //this.sharedService.changeSelectedBatch(project);
    this.selectedProjectAccess = projectaccess
    const target = event.target;
    let parent = target.parentNode;

    if (event.target.tagName != "A") {
      if (event.target.tagName == "I") {
        parent = target.parentNode.parentNode.parentNode;
      }
      if (parent.tagName == "TR") {
        if (event.ctrlKey) {
          this.selectBackGround(parent, projectaccess);
        } else {
          this.removeBack(parent, projectaccess);
        }

      }
    }


  }

  getProjectAccessList(projectAccessList: SurveyProjectAccessModel) {
    this.projectAccessItemLists = [];
    this.surveyPortalService.GetSurveyProjectAccessList(projectAccessList).subscribe(
      data => {
        if(data.isSuccess)
        {
            if (data.data.length != undefined && data.data.length > 0)
            {
              this.scrollLoad = true;
              this.projectAccessItemLists = data.data;
              this.filtersApplied = this.projectAccessItemLists[0].filtersApplied;
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

    if (column == 'HasAccess') {
      this.surveyProjectAccessItem.HasAccess = (this.surveyProjectAccessItem.HasAccess == 'Y') ? '' : 'Y';
    }
    if (column == 'UserID') {
      this.surveyProjectAccessItem.UserID = value;
    }
    if (column == 'UserEmail') {
      this.surveyProjectAccessItem.UserEmail = value;
    }
    if (column == 'ConName') {
      this.surveyProjectAccessItem.ConName = value;
    }
    if (column == 'UserStatus') {
      this.surveyProjectAccessItem.UserStatus = value;
    }

    this.surveyProjectAccessItem.PageNo = 0;
    this.filterApplied = true;
    this.getProjectAccessList(this.surveyProjectAccessItem);

  }

  clearTable() {
     $("#filterSearch").trigger("reset");
      this.scrollLoad = true;
      this.resetFilterList();

    this.getProjectAccessList(this.surveyProjectAccessItem);
  }

  orderBy(orderBy) {
    if (orderBy == this.surveyProjectAccessItem.OrderBy && this.surveyProjectAccessItem.OrderType == 'Asc') {
      this.surveyProjectAccessItem.OrderType = 'Desc';
    } else {
      this.surveyProjectAccessItem.OrderType = 'Asc';
    }
    this.surveyProjectAccessItem.OrderBy = orderBy;
    this.surveyProjectAccessItem.PageNo = 0;
    this.getProjectAccessList(this.surveyProjectAccessItem);
  }

  resetFilterList() {
    this.selectedProjectAccess = [];
    this.surveyProjectAccessItem.UserID  = '';
    this.surveyProjectAccessItem.UserName  = '';
    this.surveyProjectAccessItem.UserStatus = '';
    this.surveyProjectAccessItem.UserEmail = '';
    this.surveyProjectAccessItem.ConName = '';
    this.surveyProjectAccessItem.HasAccess = '';
    this.surveyProjectAccessItem.OrderBy = 'UserID';
    this.surveyProjectAccessItem.OrderType = 'Asc';
    this.surveyProjectAccessItem.PageNo = 0;
    this.filterApplied = false;
    this.filtersApplied = '';
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

   grantUserAccess(event: any, projectAccess) {

    this.surveyPortalService.UpdateSurveyProjectAccess(projectAccess.supCode, projectAccess.userID).subscribe(
      data => {
        if (data && data.isSuccess) {
          //console.log(data);
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      },
      error => {
        this.loaderService.hide();
        this.alertService.error(error);
      }
    );

  }

  public closeWindow() {
    this.router.navigate(['/surveying/projects']);
  }

}

