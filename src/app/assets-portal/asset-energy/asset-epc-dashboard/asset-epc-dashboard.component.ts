import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { Router } from "@angular/router";
import { AlertService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-asset-epc-dashboard',
  templateUrl: './asset-epc-dashboard.component.html',
  styleUrls: ['./asset-epc-dashboard.component.css']
})

export class AssetEpcDashboardComponent implements OnInit {
  portalNameForChart = 'Energy';
  portalName: string = "Energy";
  energyPortalAccess: any = [];
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
      this.sharedServie.energyPortalAccess.subscribe(
        data => {
          this.energyPortalAccess = data;
          if (this.energyPortalAccess.length > 0) {
            this.sharedServie.realModulesEnabled.subscribe(
              modules => {
                if (modules.length > 0) {
                  if (this.energyPortalAccess.indexOf("Dashboard") == -1 || (modules.indexOf("EPC Module") == -1 && modules.indexOf("Energy") == -1)) {
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
    const { chartName } = this.selectedBarChartXasis;
    if (chartName == "Retrieved EPCs") this.retrievedEPCs = true;
    else this.retrievedEPCs = false;

    this.showDataPanel = true;
    $('.eventdashboardovrlay').addClass('ovrlay');

  }

  closeDataPanel($event) {
    this.showDataPanel = $event
    $('.eventdashboardovrlay').removeClass('ovrlay');
  }



}
