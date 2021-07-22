import { Component, OnInit } from '@angular/core';
import { AlertService, SharedService } from '../../_services'
import { SubSink } from 'subsink';
import { Router } from "@angular/router"

@Component({
  selector: 'app-event-manager-chart',
  templateUrl: './event-manager-chart.component.html',
  styleUrls: ['./event-manager-chart.component.css']
})

export class EventManagerChartComponent implements OnInit {
  portalNameForChart = 'Tasks';
  portalName: string = "Tasks";
  selectedBarChartXasis: any;
  taskSecurityList: any = [];
  userEvents = false
  subs = new SubSink();

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
      this.sharedServie.taskPortalSecList.subscribe(
        data => {
          this.taskSecurityList = data;
          if (this.taskSecurityList.length > 0) {
            this.sharedServie.modulePermission.subscribe(
              modules => {
                if (modules.length > 0) {
                  if (this.taskSecurityList.indexOf("Event Dashboard") == -1 || modules.indexOf("Event Manager Portal Access") == -1) {
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
    this.userEvents = true
    $('.eventdashboardovrlay').addClass('ovrlay');
  }

  closeUserEvents($event) {
    this.userEvents = $event
    $('.eventdashboardovrlay').removeClass('ovrlay');
  }


}
