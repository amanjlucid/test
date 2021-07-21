import { Component, OnInit } from '@angular/core';
import { AlertService, SharedService } from '../../_services'
import { SubSink } from 'subsink';
import { Router } from "@angular/router"


@Component({
  selector: 'app-service-chart',
  templateUrl: './service-chart.component.html',
  styleUrls: ['./service-chart.component.css']
})
export class ServiceChartComponent implements OnInit {
  portalNameForChart = 'Servicing';
  portalName: string = "Servicing";
  servicePortalAccess: any = [];
  subs = new SubSink();


  constructor(
    private sharedServie: SharedService,
    private alertService : AlertService,
    private router: Router
  ) { }

 
  ngOnInit() { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.subs.add(
      this.sharedServie.servicePortalObs.subscribe(
        data => {
          this.servicePortalAccess = data;
          if (this.servicePortalAccess.length > 0) {
            // console.log(this.servicePortalAccess);
            // this.alertService.error("You have no access to configuration")
            // this.router.navigate(['/dashboard']);
          }
        }
      )
    )
  }


  gridDataEvent(event) {
    console.log(event);
  }


}
