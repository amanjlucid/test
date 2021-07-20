import { Component, OnInit } from '@angular/core';
import { AlertService, SharedService, AssetAttributeService } from '../../_services'
import { SubSink } from 'subsink';
import { Router } from "@angular/router"

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

  ngOnInit() {

  }

  gridDataEvent(event) {
    console.log(event);
  }

  openGrid(chartName: string) {
    // this.retrievedEPCs = false;
    this.showDataPanel = true;
    $('.eventdashboardovrlay').addClass('ovrlay');
  }

  closeDataPanel($event) {
    this.showDataPanel = $event
    $('.eventdashboardovrlay').removeClass('ovrlay');
  }


  // openDrillDownchart(chartEvent, parentChartObj) {
  //   if (parentChartObj != null && parentChartObj.ddChartID != undefined) {
  //     if (parentChartObj.ddChartID != 0) {
  //       const params = {
  //         "chartName": `${parentChartObj.chartName} (${chartEvent.options.name})`,
  //         "chartType": 4,
  //         "chartParameterValue": "string",
  //         "ddChartId": parentChartObj.ddChartID,
  //         "parantChartId": parentChartObj.chartID,
  //         "xAxisValue": chartEvent.options.name,
  //         "seriesId": chartEvent.options.seriesId,
  //         "color": chartEvent.color
  //       }
  //       this.renderDrillDownChart(chartEvent, params)
  //     } else {
  //       if (parentChartObj.dataSP != "") {
  //         this.openGridOnClickOfBarChart(chartEvent, parentChartObj, true);
  //       }
  //     }
  //   }
  // }


  // openGridOnClickOfBarChart(chartEvent, parentChartObj, fromPieChart: boolean = false) {
  //   if (parentChartObj.dataSP != "") {
  //     if (fromPieChart) {
  //       this.selectedBarChartXasis = {
  //         "ddChartId": parentChartObj.ddChartId != undefined ? parentChartObj.ddChartId : parentChartObj.ddChartID,
  //         "parantChartId": parentChartObj.parantChartId != undefined ? parentChartObj.parantChartId : parentChartObj.chartID,
  //         "xAxisValue": chartEvent.options.name,
  //         "seriesId": chartEvent.options.seriesId,
  //         "chartName": parentChartObj.chartName
  //       }
  //     } else {
  //       this.selectedBarChartXasis = {
  //         "ddChartId": parentChartObj.ddChartId != undefined ? parentChartObj.ddChartId : parentChartObj.ddChartID,
  //         "parantChartId": parentChartObj.parantChartId != undefined ? parentChartObj.parantChartId : parentChartObj.chartID,
  //         "xAxisValue": chartEvent.category,
  //         "seriesId": parentChartObj.seriesId,
  //         "chartName": parentChartObj.chartName
  //       }
  //     }
  //     this.openGrid(parentChartObj.chartName);
  //   }
  // }



  // renderDrillDownChart($event: any, chartData: any) {
  //   this.drawChartObj = chartData;
  //   let cl = Math.random();
  //   let compNo = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   let thisContainer = $($event.series.chart.container);

  //   let newItemConfig = {
  //     title: chartData.chartName,
  //     type: 'component',
  //     componentName: 'testComponent',
  //     componentState: { text: 'Component' + compNo }
  //   };

  //   thisContainer.closest(".lm_stack").find('.lm_selectable').click();
  //   this.myLayout.selectedItem.addChild(newItemConfig);

  // };




}

