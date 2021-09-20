import { Component, OnInit } from '@angular/core';
import { Subject, timer, Subscription } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthenticationService, EventService } from '../../_services';
import { first } from 'rxjs/operators';
declare var $: any;


@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.css']
})

export class DefaultComponent implements OnInit {
  loadComp: boolean = false;
  validationObj: any;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private authService: AuthenticationService,
    private notificationService: EventService

  ) {

  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const thirdPartyKey = params['thirdParty'];
      //console.log(thirdPartyKey);
      if (thirdPartyKey) {
        const encStr = this.router.routerState.snapshot.url;
        const splitStr = encStr.split('thirdParty=');
        const thirdParty = splitStr[1]
        this.authenticationService.validateDeepLinkParameters(thirdParty).subscribe(
          data => {
            this.validationObj = data;
            if (data && data.validated) {
              if (data.authenticatedUserCredential.access_token) {
   
                localStorage.setItem('currentUser', JSON.stringify(data.authenticatedUserCredential));
                let currentUser = data.authenticatedUserCredential;
                this.currentUser = currentUser;
                this.authService.formAuthentication(currentUser.userId).subscribe(data => {
                  //console.log(data);
                  // this.loadComponent();
                  this.router.navigate(['/asset-list'],{queryParams: {thirdParty: thirdPartyKey}} );
                })


              }
            }
          },
          error => {
            //this.loaderService.hide();
            //this.alertService.error(error);
          }
        )
      }
    });
  }

  loadComponent() {
    this.loadComp = true;
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.authService.formAuthentication(currentUser.userId).subscribe(data => {
          //console.log(data);
        })
      }
    });

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.eventUnreadMessageCount();
    this.eventSummary();
    this.endTime = this.currentUser.inactivityTimeOut;
    this.resetTimer();
    this.authService.userActionOccured.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
      this.resetTimer();
    });
  }

  closeTabds() {
    const win = window.open("about:blank", "_self");
    win.close();
    // var version = 0;
    // if (navigator.appVersion.indexOf("MSIE") != -1) {
    //   var temp = navigator.appVersion.split("MSIE");
    //   version = parseFloat(temp[1]);
    // }
    // if (version >= 5.5 && version <= 6) {
    //   self.opener = this;
    //   self.close();
    // } else {
    //   window.open('', '_parent', '');
    //   window.close();

    // }

  }


  checkGroupPermission(val: string): Boolean {
    //console.log(this.currentUser.userRoles);
    return this.currentUser.userRoles.includes(val);
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
    this.notificationService.eventUnreadMessageCount(this.currentUser.userId, '').subscribe(
      data => {
        if (data.isSuccess) {
          this.unreadMsg = data.data
          this.unreadMsgPage = data.message
        }
      }
    )
  }

  eventSummary() {
    this.notificationService.eventSummary(this.currentUser.userId).subscribe(
      data => {
        if (data.isSuccess) {
          this.notifications = data.data
          //console.log(this.notifications);
        }
      }
    )
  }

}
