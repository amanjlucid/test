import { Component, OnInit } from '@angular/core';
import { AlertService, SharedService } from '../../_services'
import { SubSink } from 'subsink';
import { Router } from "@angular/router"


@Component({
  selector: 'app-hns-chart',
  templateUrl: './hns-chart.component.html',
  styleUrls: ['./hns-chart.component.css']
})

export class HnsChartComponent implements OnInit {
  portalNameForChart = 'Health&Safety';
  portalName: string = "HNS";
  servicePortalAccess: any = [];
  subs = new SubSink();

  constructor(
    private sharedServie: SharedService,
    private alertService : AlertService,
    private router: Router
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.subs.add(
      this.sharedServie.servicePortalObs.subscribe(
        data => {
          this.servicePortalAccess = data;
          if (this.servicePortalAccess.length > 0) {
            console.log(this.servicePortalAccess);
            // this.alertService.error("You have no access to configuration")
            // this.router.navigate(['/dashboard']);
          }
        }
      )
    )
  }

  ngOnInit() { }

  gridDataEvent(event) {
    console.log(event);
  }

}
