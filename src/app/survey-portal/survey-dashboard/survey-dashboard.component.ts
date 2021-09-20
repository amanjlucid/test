import { Component, OnInit } from '@angular/core';
import { AlertService, SharedService } from '../../_services'
import { SubSink } from 'subsink';
import { Router } from "@angular/router"

@Component({
  selector: 'app-survey-dashboard',
  templateUrl: './survey-dashboard.component.html',
  styleUrls: ['./survey-dashboard.component.css']
})

export class SurveyDashboardComponent implements OnInit {
  portalNameForChart = 'Surveying';
  portalName: string = "Surveying";
  servicePortalAccess: any = [];
  subs = new SubSink();

  constructor(
    private sharedServie: SharedService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() { }

  gridDataEvent(event) {
    console.log(event);
  }


}
