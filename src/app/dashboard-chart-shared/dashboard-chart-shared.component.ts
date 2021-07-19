import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { ChartComponentModel } from '../_models';
import { AlertService, HelperService, SharedService, HnsPortalService, EventManagerDashboardService, AssetAttributeService, ChartService } from '../_services';
import { delay } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

declare var $: any;
declare var GoldenLayout: any;
declare var Highcharts: any;

@Component({
  selector: 'app-dashboard-chart-shared',
  templateUrl: './dashboard-chart-shared.component.html',
  styleUrls: ['./dashboard-chart-shared.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardChartSharedComponent implements OnInit {
  @Input() portalName: string;
  @Input() portalNameForChart: string;
  subs = new SubSink();
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  chartNames: any = [];
  myLayout: any;
  savedState: any = null;
  config: any = new ChartComponentModel();
  drawChartObj: any = null;
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  pageload: boolean = true;
  dashboardName: string;
  defaultFilterVal: string = "";
  retrievedEPCs = false
  showDataPanel = false;
  selectedBarChartXasis: any;


  constructor(
    private alertService: AlertService,
    private sharedServie: SharedService,
    private helper: HelperService,
    private chartService: ChartService
    // private eventMangerDashboardService: EventManagerDashboardService,
  ) {
    //update notification on top
    helper.updateNotificationOnTop();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.subs.add(
      this.chartService.getUserChartData(this.currentUser.userId, this.portalName)
        .pipe(delay(500))
        .subscribe(
          async data => {
            console.log(data)
            const { chartData = null, dashboard } = data.data;
            if (chartData != null) {
              this.dashboardName = dashboard;
              this.savedState = chartData.chartData;
              this.myLayout = new GoldenLayout(JSON.parse(this.savedState), $('#layoutContainer'));
            } else {
              this.savedState = null
              this.myLayout = new GoldenLayout(this.config, $('#layoutContainer')); // actual object
            }

            //GET CHART LIST BY PORTAL NAME
            const chartList = await this.chartService.getChartsList(this.portalNameForChart).toPromise();
            if (!chartList.isSuccess) {
              this.alertService.error(chartList.message);
              return;
            }

            this.chartNames = chartList.data;

            const createDefaultCharts = (container: any, state: any) => {
              if (this.drawChartObj == null && this.savedState == null) {
                const { text } = state;
                console.log(text);

                if (text == "Component1") {
                  container.setTitle(this.chartNames[0].chartName)
                  let cl = "pi111"; // default chart class start string
                  // this.renderChartTypes(this.chartNames[0], this, container, state, cl);
                } else if (text == "Component2") {
                  let cl = "pi22"; // default chart class start string
                  if (this.chartNames[1] == undefined) {
                    container.setTitle(this.chartNames[0].chartName)
                    // this.renderChartTypes(this.chartNames[0], this, container, state, cl);
                  } else {
                    container.setTitle(this.chartNames[1].chartName)
                    // this.renderChartTypes(this.chartNames[1], this, container, state, cl);
                  }

                } else if (text == "Component3") {
                  if (this.chartNames[2] == undefined) {
                    container.setTitle(this.chartNames[0].chartName)
                    // this.renderChartTypes(this.chartNames[0], this, container, state);
                  } else {
                    container.setTitle(this.chartNames[2].chartName)
                    // this.renderChartTypes(this.chartNames[2], this, container, state);
                  }

                } else if (text == "Component4") {
                  if (this.chartNames[3] != undefined) {
                    container.setTitle(this.chartNames[3].chartName)
                    // this.renderChartTypes(this.chartNames[3], this, container, state);
                  }
                }
              } else if (this.drawChartObj == null && this.savedState != null) {
                this.renderChartIfStateSaved(container, state);
              } else if (this.drawChartObj != null) {
                // this.renderChartTypes(this.drawChartObj, this, container, state);
              }
            }


            if (this.pageload) {
              this.myLayout.registerComponent('testComponent', createDefaultCharts);
              this.myLayout.init();
            }

            this.pageload = false;

          }
        )
    )


    const sideMenu = document.querySelector('.ion-md-menu');
    this.subs.add(
      fromEvent(sideMenu, 'click').subscribe(
        (value) => {
          $(".lm_goldenlayout").css("width", "100%");
          $('.lm_goldenlayout > .lm_column').css("width", "100%");
          setTimeout(() => { this.myLayout.updateSize() }, 200);
        }
      )
    )


  }



  renderChartIfStateSaved(container: any, state: any) {
    let currentStateChart = state.containerChartObj;
    const { chartType, chartName } = currentStateChart;
    if (chartType == 3) {
      let cl = "";
      if (state.text == "Component1") cl = "pi111"; // default chart class start string
      if (state.text == "Component2") cl = "pi22"; // default chart class start string
      this.renderPieChartIfStatesaved(container, state, chartName + cl)
    } else if (chartType == 1) {
      this.renderLineChartIfStatesaved(container, state, chartName);
    } else if (chartType == 4) {
      // this.renderBarChartIfStatesaved(container, state, classRefer, chartName);
    } else if (chartType == 5) {
      // this.renderGroupBarChartIfStatesaved(container, state, classRefer, chartName);
    }
  }

  renderPieChartIfStatesaved(container: any, state: any, cl: any = null) {
    cl = cl.split(" ")[0] + Math.random();
    let className = `pie${new Date().getMilliseconds()}${Math.random()}${cl}`;
    className = this.helper.replaceAll(className, ".", "");
    const filterDivCl = "filterpi" + className;
    const chartObj = state.containerChartObj;

    const { selectedFilter } = state;
    chartObj.ChartParameterValue = (selectedFilter != null && selectedFilter != "") ? selectedFilter : this.defaultFilterVal;

    this.subs.add(
      this.chartService.getChartData(chartObj).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            const { pieChartModel, chartFilterModel: pieChartFilterData } = data.data;
            let pieChartData = pieChartModel.filter(x => x.y != 0 && x.y != "" && x.y != null);

            let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px;" class="${className}">`);
            let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };
            if (pieChartFilterData != null) {
              let optHtml = "";
              for (const filterString of pieChartFilterData[0]['filterString']) {
                let selectOpt = (state.selectedFilter == filterString) ? "selected" : "";
                optHtml += (`<option ${selectOpt} value="${filterString}">${filterString}</option>`);
              }
              selectElm.html(optHtml);
              dynamicCss = { parentDiv: 95, childDiv: 100, childDivMt: 6 };
            }

            container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div><div id="${className}" style="width:100%; height: ${dynamicCss.childDiv}%; position:absolute;  margin-top:${dynamicCss.childDivMt}px;"></div> </div></div>`);

            this.chartService.pieChartInit(className, pieChartData, chartObj);

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              selectedFilter: chartObj.ChartParameterValue
            });

            if (pieChartFilterData != null) {
              $("." + filterDivCl).html(selectElm);
            }

            $(document).on('change', '.' + className, function () {
              let val = $(this).val();
              let chartName = $(".line" + className).val();
              let dataForChart = this.chartNames.find(x => x.chartName == chartName);
              dataForChart.ChartParameterValue = val;
              this.getPieChartData(dataForChart, className, container, state, chartObj);
            })
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

    this.resizeContainer(container);

  }

  getPieChartData(dataForChart: any, className: any, container: any, state: any, chartObj: any) {
    this.subs.add(
      this.chartService.getChartData(dataForChart).subscribe(
        data => {
          if (data.isSuccess) {
            const { pieChartModel } = data.data;
            let pieChartData = pieChartModel.filter(x => x.y != 0 && x.y != "" && x.y != null);

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              selectedFilter: dataForChart.ChartParameterValue
            });

            this.chartService.pieChartInit(className, pieChartData, chartObj, null, null, true);
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }


  renderLineChartIfStatesaved(container: any, state: any, cl: any = null) {
    cl = cl.split(" ")[0] + Math.random();
    let className = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
    className = this.helper.replaceAll(className, ".", "");
    let filterDivCl = "filterli" + className;
    let chartObj = state.containerChartObj;

    const { selectedFilter } = state;
    chartObj.ChartParameterValue = (selectedFilter != null && selectedFilter != "") ? selectedFilter : this.defaultFilterVal;

    this.subs.add(
      this.chartService.getChartData(chartObj).subscribe(
        data => {
          if (data.isSuccess) {
            console.log(data);
            const { lineChartModel: lineChartData, chartFilterModel: lineChartFilterData, startDate, endtDate } = data.data;

            let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px; margin-bottom:10px;" class="${className}">`);
            let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };

            if (lineChartFilterData != null) {
              let optHtml = "";
              for (const filterString of lineChartFilterData[0]['filterString']) {
                let selectOpt = (state.selectedFilter == filterString) ? "selected" : "";
                optHtml += (`<option ${selectOpt} value="${filterString}">${filterString}</option>`);
              }
              selectElm.html(optHtml);
              dynamicCss = { parentDiv: 94, childDiv: 98, childDivMt: 6 };
            }

            let xaxis = { 'start': startDate, 'end': endtDate }
            console.log(xaxis)

            container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div> <div id="${className}" style="position:absolute; width:100%; height:${dynamicCss.childDiv}%;"></div> </div></div>`);
           
            this.chartService.lineChartInit(className, lineChartData, xaxis, null, null);

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              xaxis: xaxis,
              selectedFilter: chartObj.ChartParameterValue
            });


            if (lineChartFilterData != null) {
              $("." + filterDivCl).html(selectElm);
            }

            $(document).on('change', '.' + className, function () {
              let val = $(this).val();
              let chartName = $(".line" + className).val();
              let dataForChart = this.chartNames.find(x => x.chartName == chartName);
              dataForChart.ChartParameterValue = val;
              this.getLineChartData(dataForChart, className, container, state, chartObj);
            });
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )


    this.resizeContainer(container);

  }


  resizeContainer(container) {
    container.on('resize', () => {
      setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 400);
    })
  }


  saveChartsState() {
    if ($('.lm_vertical').length == 0 && $('.lm_horizontal').length == 0 && $('.lm_selectable').length == 0) {
      this.alertService.error("There is no state to save.");
      return
    }
    const state = JSON.stringify(this.myLayout.toConfig());
    const chartState = { UserId: this.currentUser.userId, ChartData: state, dashboard: this.portalName }
    this.subs.add(
      this.chartService.saveUserChartData(chartState).subscribe(
        data => {
          if (data.isSuccess) {
            this.dashboardName = this.portalName;
            this.alertService.success("Chart state saved successfully.")
          } else {
            this.alertService.error("Something went wrong.")
          }
        }
      )
    )
  }

  openChartList() {
    const scrollTop = $('.layout-container').height();
    $('.search-container').show();
    $('.search-container').css('height', scrollTop);
    if ($('.search-container').hasClass('dismiss')) {
      $('.search-container').removeClass('dismiss').addClass('selectedcs').show();
    }
  }

  closeSearchBar() {
    if ($('.search-container').hasClass('selectedcs')) {
      $('.search-container').removeClass('selectedcs').addClass('dismiss');
      $('.search-container').animate({ width: 'toggle' });
    }
  }

}
