import { Component, OnInit } from '@angular/core';
import { AlertService, SharedService } from '../../_services';
import { SubSink } from 'subsink';
import { Router } from "@angular/router";

@Component({
  selector: 'app-worksorders-dashboard',
  templateUrl: './worksorders-dashboard.component.html',
  styleUrls: ['./worksorders-dashboard.component.css']
})

export class WorksordersDashboardComponent implements OnInit {
  portalNameForChart = 'WorksOrder';
  portalName: string = "Works Orders";
  worksOrdersAccess: any = [];
  subs = new SubSink();

  retrievedEPCs = false
  showDataPanel = false;
  selectedBarChartXasis: any;

  constructor(
    private alertService: AlertService,
    private sharedServie: SharedService,
    private router: Router,
  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.subs.add(
      this.sharedServie.worksOrdersAccess.subscribe(
        data => {
          this.worksOrdersAccess = data;
          if (this.worksOrdersAccess.length > 0) {
            this.sharedServie.realModulesEnabled.subscribe(
              modules => {
                if (modules.length > 0) {
                  if (this.worksOrdersAccess.indexOf("Dashboard") == -1 || modules.indexOf("WOPM") == -1) {
                    this.alertService.error("You have no access to configuration")
                    this.router.navigate(['/dashboard']);
                  }
                }
              }
            )
          }
        }
      )
    )
  }

 

  gridDataEvent(event) {
    if (event && typeof event == 'object') {
      this.selectedBarChartXasis = event
      this.openGrid();
    }
  }

  openGrid() {
    // this.retrievedEPCs = false;
    this.showDataPanel = true;
    $('.eventdashboardovrlay').addClass('ovrlay');
  }

  closeDataPanel($event) {
    this.showDataPanel = $event
    $('.eventdashboardovrlay').removeClass('ovrlay');
  }
  

}

