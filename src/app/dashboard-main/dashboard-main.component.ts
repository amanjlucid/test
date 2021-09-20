import { Component, OnInit } from '@angular/core';
import { AlertService, SharedService } from '../_services'
import { SubSink } from 'subsink';
import { Router } from "@angular/router"

@Component({
  selector: 'app-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.css']
})
export class DashboardMainComponent implements OnInit {
  portalNameForChart = 'Home';
  portalName: string = "Home";
  servicePortalAccess: any = [];
  dashboardPermission: any;
  modulePermission: any;
  subs = new SubSink();

  constructor(
    private sharedService: SharedService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {

    this.subs.add(
      this.sharedService.modulePermission.subscribe(async data => {
        this.modulePermission = await data
      })
    )

      //Check module permission
      this.subs.add(
        this.sharedService.apexPortalObs.subscribe(async data => {
          this.dashboardPermission = await data
          if (this.dashboardPermission != undefined && this.modulePermission != undefined) {
            let v1 = this.dashboardPermission
            this.pageLoadOnDashBoard();
          }
        })
      )

   }

   pageLoadOnDashBoard() {
      setTimeout(() => {
        if (!this.dashboardPermission.includes('Dashboard')) {
          if (this.modulePermission.includes('Asset Portal Access')) {
            this.router.navigate(['asset-list']);
          } else {
            this.router.navigate(['my-profile']);
          }
          return
        }
     }, 1000);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() { }

  gridDataEvent(event) {
    console.log(event);
  }


}

