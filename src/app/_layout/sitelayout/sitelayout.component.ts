import { Component, OnInit, AfterContentChecked, OnDestroy, HostListener } from '@angular/core';
import { Subject, timer, Subscription } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SubSink } from 'subsink';
import { AuthenticationService, EventService, AssetAttributeService, SharedService, FunctionSecurityService, SettingsService } from '../../_services';
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
  servicePortalAccess: any = [];
  hnsPortalMenuList: any = [];
  hnsPortalPermissions:any = [];
  // underDevelopment: boolean = true;
  silverLightMenus: any = [
    {
      menuName: "Assets",
      silverLightLink: "http://104.40.138.8/Rowanwood/AssetPortal",
      grpPermissionName: "Asset Portal Access",
    },
    {
      menuName: "Asbestos",
      silverLightLink: "http://104.40.138.8/Rowanwood/AsbestosPortal",
      grpPermissionName: "Asbestos Portal Access",
    },
    {
      menuName: "Security",
      silverLightLink: "http://104.40.138.8/apexcurrent/securityportal",
      grpPermissionName: "Security Access",
    },
    {
      menuName: "Servicing",
      silverLightLink: "http://104.40.138.8/Rowanwood/SIM_Portal",
      grpPermissionName: "Servicing Portal Access",
    },
    {
      menuName: "Health & Safety",
      silverLightLink: "http://104.40.138.8/Rowanwood/HealthAndSafety",
      grpPermissionName: "Health And Safety Portal Access",
    },
    {
      menuName: "Energy",
      silverLightLink: "http://104.40.138.8/Rowanwood/EnergyPortal",
      grpPermissionName: "Energy Portal Access",
    },
    {
      menuName: "Event Manager",
      silverLightLink: "http://104.40.138.8/Rowanwood/EventManager",
      grpPermissionName: "BA_EventManager",
    },
    {
      menuName: "Reporter",
      silverLightLink: "http://104.40.138.8/Rowanwood/WebReporter",
      grpPermissionName: "Web Reporter Portal Access",
    },
    {
      menuName: "Surveying",
      silverLightLink: "http://104.40.138.8/Rowanwood/SurveyPortal",
      grpPermissionName: "Survey Portal Access",
    },
    {
      menuName: "Works Orders",
      silverLightLink: "http://104.40.138.8/Rowanwood/WorksOrders",
      grpPermissionName: "Works Order Mobile Portal Access",
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
        this.authService.formAuthentication(currentUser.userId).subscribe(data => {
          //console.log(data);
        })
      }
    });
  }



  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

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

    this.getSilverLightMenu();
    this.checkPortalAccess();
    this.getAsbestosUserSecurity();
    this.checkModulePermission();
    this.checkServiceTabAccess();
    this.hnsPortalAccess();

    this.subs.add(
      this.sharedServie.servicePortalObs.subscribe(data => { this.servicePortalAccess = data; })
    )

    this.subs.add(
      this.sharedServie.hnsPortalSecurityList.subscribe(data => this.hnsPortalMenuList = data)
    )

    // this.route.queryParams.subscribe(params => {
    //   const servicePortal = params['servicing'];
    //   if (servicePortal != undefined && servicePortal == "true") {
    //     console.log('sitel')
    //   } else {
    //     console.log('sitesdfsl')
    //   }
    // });
  }

  // ngAfterContentChecked() {
  //   //$('.sidbarDiv').removeClass('bg-sidenav-theme');
  //   //$('#theme-settings').hide();

  // }

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
            this.notifications = data.data
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



  // dashboardCalanderEvents() {
  //   let userId = this.currentUser.userId 
  //   this.notificationService.dashboardCalanderEvents(userId).subscribe(
  //     data => {

  //       if(data.isSuccess){
  //         this.eventLists = data.data;
  //         //console.log(this.eventLists)
  //       }
  //     }
  //   )
  // }


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





}