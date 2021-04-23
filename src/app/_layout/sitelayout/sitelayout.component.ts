import { Component, OnInit, AfterContentChecked, OnDestroy, HostListener } from '@angular/core';
import { Subject, timer, Subscription } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SubSink } from 'subsink';
import { AuthenticationService, EventService, AssetAttributeService, SharedService, FunctionSecurityService, SettingsService } from '../../_services';
import { appConfig } from '../../app.config';
declare var $: any;


@Component({
  selector: 'app-sitelayout',
  templateUrl: './sitelayout.component.html',
  styleUrls: ['./sitelayout.component.css']
})
export class SitelayoutComponent implements OnInit, OnDestroy {

  currentUser;
  timeoutID;
  unreadMsg;
  unreadMsgPage;
  notifications;
  eventLists: any;
  minutesDisplay = 0;
  secondsDisplay = 0;
  endTime = 20;
  unsubscribe$: Subject<void> = new Subject();
  timerSubscription: Subscription;
  subs = new SubSink();
  moduleAccess: any;
  realModulesEnabled: any;
  servicePortalAccess: any = [];
  hnsPortalMenuList: any = [];
  hnsPortalPermissions: any = [];
  energyPortalPermissions: any = [];
  WorksOrdersPermissions: any = [];
  tasksPortalPermissions: any = [];
  reporterPortalPermissions: any = [];
  apexDashboardPermission: any = [];
  SurveyPortalPermissions: any = [];
  BatchesLink: string = '';
  BatchSurveysLink: string = '';
  BatchesLinkColor: string = 'Yellow';
  ProjectSurveysLink: string = '';
  // underDevelopment: boolean = true;
  silverLightMenus: any = [
    {
      menuName: "Health & Safety",
      silverLightLink: `${appConfig.silverLightUrl}/HealthAndSafety`,
      grpPermissionName: "Health And Safety Portal Access",
    },
    {
      menuName: "Energy",
      silverLightLink: `${appConfig.silverLightUrl}/EnergyPortal`,
      grpPermissionName: "Energy Portal Access",
    },
    {
      menuName: "Surveying",
      silverLightLink: `${appConfig.silverLightUrl}/SurveyPortal`,
      grpPermissionName: "Survey Portal Access",
    },
    {
      menuName: "Works Orders",
      silverLightLink: `${appConfig.silverLightUrl}/WorksOrders`,
      grpPermissionName: "Works Order Portal Access",
    }
  ];


  developedModuleList: any = [];

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private notificationService: EventService,
    private assetService: AssetAttributeService,
    private sharedServie: SharedService,
    private functionSecurity: FunctionSecurityService,
    private settingService: SettingsService
  ) {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
          this.authService.formAuthentication(currentUser.userId).subscribe(data => {
            //console.log(data);
          })
        }
      }
    });
  }



  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.subs.add(
      this.sharedServie.userNotification.subscribe(data => this.notifications = data)
    )
    // console.log(this.currentUser);
    this.eventUnreadMessageCount();
    this.eventSummary();
    this.endTime = this.currentUser.inactivityTimeOut;
    this.resetTimer();

    this.subs.add(
      this.authService.userActionOccured.pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
        this.resetTimer();
      })
    )

    this.apexPortalAccess();
    this.getSilverLightMenu();
    this.checkPortalAccess();
    this.getAsbestosUserSecurity();
    this.checkModulePermission();
    this.getRealModulesEnabledList();
    this.checkServiceTabAccess();
    this.hnsPortalAccess();
    this.getEnergyPortalAccess();
    this.eventPortalAccess();
    this.reporterPortalAccess();
    this.getWorksOrdersAccess();
    this.SurveyPortalAccess();

    this.subs.add(
      this.sharedServie.servicePortalObs.subscribe(data => { this.servicePortalAccess = data; })
    )

    this.subs.add(
      this.sharedServie.hnsPortalSecurityList.subscribe(data => this.hnsPortalMenuList = data)
    )

  }

  checkLinkEnabled(divValue: string, linkValue: string): Boolean {
    let linkExists = false;
    if (sessionStorage.getItem(linkValue)) {
      linkExists = true;
    }

    if (divValue == 'firstLink') {
      return linkExists;
    }
    else {
      return !linkExists;
    }
  }


  checkModulePermission() {
    this.subs.add(
      this.authService.checkModulePermission(this.currentUser.userId).subscribe(
        data => {
          this.moduleAccess = data;
          this.sharedServie.changeModulePermission(data);
        }
      )
    )
  }

  getRealModulesEnabledList() {
    this.subs.add(
      this.authService.getRealModulesEnabledList().subscribe(
        data => {
          this.realModulesEnabled = data.data;
          this.sharedServie.changeRealModulesEnabled(data.data);
        }
      )
    )
  }

  checkModuleEnabled(val: string): Boolean {
    if (this.realModulesEnabled != undefined) {
      return this.realModulesEnabled.includes(val);
    }
  }


  checkGroupPermission(val: string): Boolean {
    if (this.moduleAccess != undefined) {
      return this.moduleAccess.includes(val);
    }
  }

  checkUnderDevelopmentMenuPermission(name: string): Boolean {
    if (this.moduleAccess != undefined) {
      return this.developedModuleList.some(x => x.menuName == name && x.menuVisible == 1);;
    }
  }

  checkAngularGrpPermission(name: string, accessName: string, forAngular: number): Boolean {
    //forAngular params = 1 for angular menu and 0 for silverlight menu check
    if (this.moduleAccess != undefined) {
      if (name == "Security") {
        return this.developedModuleList.some(x => x.menuName == name && x.linkType == forAngular && this.currentUser.admin == "Y")
      }

      return this.moduleAccess.includes(accessName) && this.developedModuleList.some(x => x.menuName == name && x.linkType == forAngular && x.menuVisible == 1);
    }
  }

  checkMenuAccess(name: string, forAngular: number): Boolean {
    //forAngular params = 1 for angular menu and 0 for silverlight menu check
    if (this.moduleAccess != undefined) {
      if (name == "Security") {
        return this.developedModuleList.some(x => x.menuName == name && x.linkType == forAngular && this.currentUser.admin == "Y")
      }
      return this.developedModuleList.some(x => x.menuName == name && x.linkType == forAngular && x.menuVisible == 1);
    }
  }


  checkSilverLightPortals(name: string, accessName: string, forAngular: number): Boolean {
    //forAngular params = 1 for angular menu and 0 for silverlight menu check
    if (this.moduleAccess != undefined) {
      if (name == "Security") {
        return this.developedModuleList.some(x => x.menuName == name && x.linkType == forAngular && this.currentUser.admin == "Y")
      }
      return this.moduleAccess.includes(accessName) && this.developedModuleList.some(x => x.menuName == name && x.linkType == forAngular);
    }
  }


  resetTimer(endTime: number = this.endTime) {
    const interval = 1000;
    const duration = endTime * 60;
    this.timerSubscription = timer(0, interval).pipe(
      take(duration)
    ).subscribe(value =>

      this.render((duration - +value) * interval),
      err => { },
      () => {
        $('.bgblur').removeClass('ovrlay');
        this.router.navigate(['/login']);

      }
    )
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.subs.unsubscribe();
  }

  private render(count) {
    this.secondsDisplay = this.getSeconds(count);
    this.minutesDisplay = this.getMinutes(count);
  }

  private getSeconds(ticks: number) {
    const seconds = ((ticks % 60000) / 1000).toFixed(0);
    return this.pad(seconds);
  }

  private getMinutes(ticks: number) {
    const minutes = Math.floor(ticks / 60000);
    return this.pad(minutes);
  }

  private pad(digit: any) {
    return digit <= 9 ? '0' + digit : digit;
  }

  eventUnreadMessageCount() {
    this.subs.add(
      this.notificationService.eventUnreadMessageCount(this.currentUser.userId, '').subscribe(
        data => {
          if (data.isSuccess) {
            this.unreadMsg = data.data
            this.unreadMsgPage = data.message
          }
        }
      )
    )
  }

  eventSummary() {
    this.subs.add(
      this.notificationService.eventSummary(this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            // this.notifications = data.data
            this.sharedServie.changeUserNotification(data.data)
          }
        }
      )
    )
  }


  checkPortalAccess() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'Asbestos Portal').subscribe(
        data => {
          if (data && data.isSuccess)
            this.sharedServie.changeAsbestosPortalAccess(data.data);
        }
      )
    )
  }


  getEnergyPortalAccess() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'Energy Portal').subscribe(
        data => {
          if (data && data.isSuccess) {
            this.energyPortalPermissions = data.data;
            this.sharedServie.changeEnergyPortalAccess(data.data);
          }

        }
      )
    )
  }

  checkEnergyPortalAccess(val: string): Boolean {
    if (this.energyPortalPermissions != undefined) {
      return this.energyPortalPermissions.includes(val);
    }
  }


  getWorksOrdersAccess() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'Programme Management').subscribe(
        data => {
          if (data && data.isSuccess) {
            this.WorksOrdersPermissions = data.data;
            this.sharedServie.changeWorksOrdersAccess(data.data);
          }

        }
      )
    )
  }

  checkWorksOrdersAccess(val: string): Boolean {
    if (this.WorksOrdersPermissions != undefined) {
      return this.WorksOrdersPermissions.includes(val);
    }
  }

  checkServiceTabAccess() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'sim portal').subscribe(
        data => {
          let servicePortalAccess: any = [];
          if (data.isSuccess) {
            if (data.data.length > 0) {
              servicePortalAccess = data.data;
            }
          }
          this.sharedServie.changeServicePortalObs(servicePortalAccess)
        }
      )
    )
  }

  hnsPortalAccess() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'Health And Safety Portal').subscribe(
        data => {
          let hnsPortalAccess: any = [];
          if (data.isSuccess) {
            if (data.data.length > 0) {
              hnsPortalAccess = data.data;
              this.hnsPortalPermissions = hnsPortalAccess
              // console.log(hnsPortalAccess)
            }
          }
          this.sharedServie.changeHnsPortalSecurityList(hnsPortalAccess);
        }
      )
    )
  }

  SurveyPortalAccess() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'Survey Portal').subscribe(
        data => {
          let SurveyPortalAccess: any = [];
          if (data.isSuccess) {
            if (data.data.length > 0) {
              SurveyPortalAccess = data.data;
              this.SurveyPortalPermissions = SurveyPortalAccess
              // console.log(SurveyPortalAccess)
            }
          }
          this.sharedServie.changeSurveyPortalSecurityList(SurveyPortalAccess);
        }
      )
    )
  }

  eventPortalAccess() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'Event Manager').subscribe(
        data => {
          if (data.isSuccess) {
            this.tasksPortalPermissions = data.data;
          }
          this.sharedServie.changeTaskPortalSecurityList(this.tasksPortalPermissions);
        }
      )
    )
  }

  reporterPortalAccess() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'Web Reporter Portal').subscribe(
        data => {
          if (data.isSuccess) {
            this.reporterPortalPermissions = data.data;
          }
          this.sharedServie.changeWebReporterPermissionData(this.reporterPortalPermissions);
        }
      )
    )
  }


  apexPortalAccess() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'Apex').subscribe(
        data => {
          if (data.isSuccess) {
            this.apexDashboardPermission = data.data;
          }
          this.sharedServie.changeApexPortalPermissionData(this.apexDashboardPermission);
        }
      )
    )
  }




  getAsbestosUserSecurity() {
    this.subs.add(
      this.assetService.apexGetAssetManagementSecurity(this.currentUser.userId, 'Asbestos Portal').subscribe(
        data => {
          if (data.isSuccess) {
            this.sharedServie.changeAsbestosPropertyAccess(data.data);
          }
        }
      )
    )
  }


  checkValueInArray(val: string) {
    if (this.servicePortalAccess == undefined || this.servicePortalAccess.length == 0) {
      return false;
    }
    if (this.servicePortalAccess.indexOf(val) !== -1) {
      return true;
    }
    return false;
  }

  checkServiceMenuAccess() {
    if (this.servicePortalAccess == undefined || this.servicePortalAccess.length == 0) {
      return false;
    }
    if (this.servicePortalAccess.indexOf('Charts Tab') !== -1 || this.servicePortalAccess.indexOf('Management Tab') !== -1) {
      return true
    }
    return false;
  }

  checkHnsLeftSideMenu() {
    if (this.hnsPortalMenuList == undefined || this.hnsPortalMenuList.length == 0) {
      return false;
    }
    if (this.hnsPortalMenuList.indexOf('Dashboard') !== -1 || this.hnsPortalMenuList.indexOf('Definitions') !== -1 || this.hnsPortalMenuList.indexOf('Results') !== -1) {
      return true
    }
    return false;
  }

  getSilverLightMenu() {
    this.subs.add(
      this.settingService.getSilverLightMenu().subscribe(
        data => {
          if (data.isSuccess) {
            this.developedModuleList = data.data;
          }
        }
      )
    )
  }


  redirectToUserEevnt(val) {
    const host = window.location.hostname;

    let siteUrl = `https://apexdevweb.rowanwood.ltd/dev/rowanwood/tasks/tasks?seq=${val.eventId}`

    let win: any = window;
    win.location = siteUrl;
    //    window.open(siteUrl);
  }



  isActive(base: string): boolean {
    return this.router.url.includes(`/${base}`);
  }

}
