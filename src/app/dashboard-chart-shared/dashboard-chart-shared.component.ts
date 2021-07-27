import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, HostListener } from '@angular/core';
import { SubSink } from 'subsink';
import { ChartComponentModel } from '../_models';
import { AlertService, HelperService, ChartService } from '../_services';
import { delay } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

declare var $: any;
declare var GoldenLayout: any;

type gridDataEventType = {
  chartRef: any
  chartObject: any
  chartType: string
};

const cloneObject = (data: any) => JSON.parse(JSON.stringify(data));
const cloneData = (data: any[]) => data.map(item => Object.assign({}, item));

@Component({
  selector: 'app-dashboard-chart-shared',
  templateUrl: './dashboard-chart-shared.component.html',
  styleUrls: ['./dashboard-chart-shared.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class DashboardChartSharedComponent implements OnInit {
  @Input() portalName: string;
  @Input() portalNameForChart: string;
  @Output() gridDataEvent = new EventEmitter<gridDataEventType>();
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
  defaultFilterVal: string = "0_OPTIVO:CONTRACT1:OPTGAS2";
  goldenLayoutStyle = {
    height: "500px",
    minHeight: "500px",
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateChartLayoutSize();
  }
  numberOfChartCanBeAdded = 10;

  constructor(
    private alertService: AlertService,
    private helper: HelperService,
    private chartService: ChartService
  ) {
    //update notification on top
    helper.updateNotificationOnTop();
  }

  ngOnDestroy() {
    //EMPTY CHART CLICK SUBSCRIPTION ON COMPONENT LEAVE
    this.chartService.changeChartInfo([]);
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    //UPDATE LAYOUT HEIGHT ON LOAD
    this.updateChartLayoutSize(true);

    //SUBSCRIBE CHART CLICK
    this.subs.add(
      this.chartService.chartInfo.subscribe(data => this.handleChartClick(data))
    )

    //GET CHART AND ITS DATA
    this.subs.add(
      this.chartService.getUserChartData(this.currentUser.userId, this.portalName)
        .pipe(delay(500))//DELAY 500 MILISECOND 
        .subscribe(
          async data => {
            const { chartData = null, dashboard, numberOfChart = 10 } = data.data;
            if (chartData != null) {
              this.dashboardName = dashboard;
              this.savedState = chartData.chartData;
              this.numberOfChartCanBeAdded = numberOfChart
              this.myLayout = new GoldenLayout(JSON.parse(this.savedState), $('#layoutContainer'));
            } else {
              this.savedState = null
              this.myLayout = new GoldenLayout(this.config, $('#layoutContainer')); // ACTUAL OBJECT
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
                if (text == "Component1") {
                  container.setTitle(this.chartNames[0].chartName)
                  this.renderChartTypes(this.chartNames[0], container, state);
                } else if (text == "Component2") {
                  if (this.chartNames[1] == undefined) {
                    container.setTitle(this.chartNames[0].chartName)
                    this.renderChartTypes(this.chartNames[0], container, state);
                  } else {
                    container.setTitle(this.chartNames[1].chartName)
                    this.renderChartTypes(this.chartNames[1], container, state);
                  }
                } else if (text == "Component3") {
                  if (this.chartNames[2] == undefined) {
                    container.setTitle(this.chartNames[0].chartName)
                    this.renderChartTypes(this.chartNames[0], container, state);
                  } else {
                    container.setTitle(this.chartNames[2].chartName)
                    this.renderChartTypes(this.chartNames[2], container, state);
                  }
                } else if (text == "Component4") {
                  if (this.chartNames[3] != undefined) {
                    container.setTitle(this.chartNames[3].chartName)
                    this.renderChartTypes(this.chartNames[3], container, state);
                  }
                }
              } else if (this.drawChartObj == null && this.savedState != null) {
                this.renderChartIfStateSaved(container, state);
              } else if (this.drawChartObj != null) {
                this.renderChartTypes(this.drawChartObj, container, state);
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


    //RESIZE CHART ON COLLAPSE OF SIDEBAR
    const sideMenu = document.querySelector('.ion-md-menu');
    this.subs.add(
      fromEvent(sideMenu, 'click').subscribe(value => this.updateChartLayoutSize())
    )


  }

  updateChartLayoutSize(onlyLayoutHeight = false) {
    const innerHeight = window.innerHeight - 200;
    this.goldenLayoutStyle.height = `${innerHeight}px`;
    setTimeout(() => this.goldenLayoutStyle.minHeight = `${innerHeight + 2}px`, 4500);

    if (!onlyLayoutHeight) {
      $(".lm_goldenlayout").css("width", "100%");
      $('.lm_goldenlayout > .lm_column').css("width", "100%");
      setTimeout(() => { this.myLayout.updateSize() }, 300);
    }

  }


  renderChartIfStateSaved(container: any, state: any) {
    let currentStateChart = state.containerChartObj;
    const { chartType, chartName } = currentStateChart;
    if (chartType == 3) {
      let cl = "";
      if (state.text == "Component1") cl = "pi111"; // DEFAULT CHART CLASS START STRING
      if (state.text == "Component2") cl = "pi22"; // DEFAULT CHART CLASS START STRING
      this.renderPieChartIfStatesaved(container, state, chartName + cl)
    }

    if (chartType == 1) this.renderLineChartIfStatesaved(container, state, chartName);
    if (chartType == 4) this.renderBarChartIfStatesaved(container, state, chartName);
    if (chartType == 5) this.renderGroupBarChartIfStatesaved(container, state, chartName);
  }


  // RENDER CHART TYPE ON CLICK
  renderChartTypes(chartObj: any, container: any, state: any) {
    let selectedFiler = ''

    if (chartObj.chartParameters == 1) {
      if (chartObj.ChartParameterValue) selectedFiler = chartObj.ChartParameterValue;
      else selectedFiler = this.defaultFilterVal;
    } else {
      selectedFiler = this.defaultFilterVal;
    }

    const { chartName, chartType } = chartObj;
    const tempState = {
      containerChartObj: chartObj,
      selectedFilter: selectedFiler,
      mode: 'new'
    }

    //MERGE STATE
    state = { ...state, ...tempState }

    if (chartType == 3) {
      let cl = "";
      if (state.text == "Component1") cl = "pi111"; // DEFAULT CHART CLASS START STRING
      if (state.text == "Component2") cl = "pi22"; // DEFAULT CHART CLASS START STRING
      this.renderPieChartIfStatesaved(container, state, chartName + cl)
    }

    if (chartType == 1) this.renderLineChartIfStatesaved(container, state, chartName);
    if (chartType == 4) this.renderBarChartIfStatesaved(container, state, chartName);
    if (chartType == 5) this.renderGroupBarChartIfStatesaved(container, state, chartName);

  }


  renderChart($event: any, side: string, chartData: any) {
    if ($('.lm_vertical').length == 0 && $('.lm_horizontal').length == 0 && $('.lm_selectable').length == 0) {
      this.createNewChart($event, side, chartData);
    } else {
      const numberOfCharts = document.querySelectorAll('.lm_item_container').length;
      if (numberOfCharts >= this.numberOfChartCanBeAdded) {
        this.alertService.error(`Maximum ${this.numberOfChartCanBeAdded} chart can be added.`)
        return
      }

      this.drawChartObj = chartData;
      let cl = Math.random();
      let compNo = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
      let newItemConfig = {
        title: chartData.chartName,
        type: 'component',
        componentName: 'testComponent',
        componentState: { text: 'Component' + compNo }
      };
      if ($('.lm_horizontal').length > 0 && (side === "left" || side === "right")) {
        if (side === "left") {
          $(".lm_horizontal").first().prev(".lm_stack").find('.lm_selectable').click();
        } else {
          $(".lm_horizontal").first().next(".lm_stack").find('.lm_selectable').click();
        }
      } else if ($('.lm_horizontal').length == 0 && (side === "left" || side === "right")) {
        $("#layoutContainer .lm_stack").first().find('.lm_selectable').click();
      } else if ($('.lm_vertical').length > 0 && side === "bottom") {
        $(".lm_vertical").first().next(".lm_stack").find('.lm_selectable').click();
      } else if ($('.lm_vertical').length == 0 && side === "bottom") {
        $("#layoutContainer .lm_stack").first().find('.lm_selectable').click();
      }
      this.myLayout.selectedItem.addChild(newItemConfig);
    }

  };


  // create new chart when all tabs are closed
  createNewChart($event: any, side: string, chartData: any) {
    this.myLayout.destroy();
    this.drawChartObj = chartData;
    let cl = Math.random();
    let compNo = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
    let config = {
      settings: {
        selectionEnabled: true
      },
      content: [{
        type: 'row',
        isClosable: false,
        content: [{
          title: chartData.chartName,
          type: 'component',
          componentName: 'testComponent',
          componentState: { text: 'Component' + compNo }
        }]
      }]
    };
    this.myLayout = new GoldenLayout(config, $('#layoutContainer')); // actual object

    let createDefaultCharts = (container: any, state: any) => {
      if (this.drawChartObj == null && this.savedState == null) {
        if (state.text == "Component1") {
          container.setTitle(this.chartNames[0].chartName)
          let cl = "pi111"; // default chart class start string
          this.renderChartTypes(this.chartNames[0], container, state);
        } else if (state.text == "Component2") {
          let cl = "pi22"; // default chart class start string
          container.setTitle(this.chartNames[1].chartName)
          this.renderChartTypes(this.chartNames[1], container, state);
        } else if (state.text == "Component3") {
          container.setTitle(this.chartNames[2].chartName)
          this.renderChartTypes(this.chartNames[2], container, state);
        }
      } else if (this.drawChartObj == null && this.savedState != null) {
        this.renderChartIfStateSaved(container, state);
      } else if (this.drawChartObj != null) {
        this.renderChartTypes(this.drawChartObj, container, state);
      }
    }

    this.myLayout.registerComponent('testComponent', createDefaultCharts);
    this.myLayout.init();

  }


  getUniqueClassName(cl, chartType) {
    cl = cl.split(" ")[0] + Math.random();
    let className = `${chartType}${new Date().getMilliseconds()}${Math.random()}${cl}`;
    return this.helper.replaceAll(className, ".", "");
  }

  createFilterDropdown(filterStrings, { className, filterDivCl, selectedFilter = '' }) {
    let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px;" class="${className}">`);
    let optHtml = "";
    for (const filterString of filterStrings) {
      let selectOpt = (selectedFilter == filterString) ? "selected" : "";
      optHtml += (`<option ${selectOpt} value="${filterString}">${filterString}</option>`);
    }
    selectElm.html(optHtml);
    $("." + filterDivCl).html(selectElm);
  }

  renderFilteredChart(className, container, state, chartType) {
    const selectedValue = $(`.${className}`).val();
    const chartName = $(`.line${className}`).val();
    let chartNames = cloneData(this.chartNames);
    let dataForChart = chartNames.find(x => x.chartName == chartName);
    dataForChart.ChartParameterValue = selectedValue;
    
    //reset state object
    state.containerChartObj = dataForChart;
    state.selectedFilter = selectedValue;
  
    if (chartType == 'pie') this.getPieChartData(dataForChart, className, container, state);
    if (chartType == 'line') this.getLineChartData(dataForChart, className, container, state);
    if (chartType == 'bar') this.getBarChartData(dataForChart, className, container, state);
    if (chartType == 'bar') this.getGroupBarChartData(dataForChart, className, container, state);

  }


  renderPieChartIfStatesaved(container: any, state: any, cl: any = null) {
    const className = this.getUniqueClassName(cl, 'pie');
    const filterDivCl = "filterpi" + className;

    const { selectedFilter, containerChartObj: chartObj } = state;  //Object destructuring 
    chartObj.ChartParameterValue = (selectedFilter != null && selectedFilter != "") ? selectedFilter : this.defaultFilterVal;

    this.subs.add(
      this.chartService.getChartData(chartObj).subscribe(
        data => {
          if (data.isSuccess) {
            const { pieChartModel, chartFilterModel: pieChartFilterData } = data.data;
            const pieChartData = pieChartModel.filter(x => x.y != 0 && x.y != "" && x.y != null);

            const chartarea = container.getElement().html(`<div class="row" style="width:100%; height:100%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div><div id="${className}" style="width:100%; height: 100%; position:absolute;  margin-top:0px;"></div> </div></div>`);

            if (pieChartFilterData != null) {
              this.createFilterDropdown(pieChartFilterData[0]['filterString'], { className, filterDivCl, selectedFilter });
              chartarea[0].querySelector(`.${className}`).addEventListener("change", (event) => this.renderFilteredChart(className, container, state, 'pie'));
              chartarea[0].querySelector('.row').style.height = "94%";
              chartarea[0].querySelector(`#${className}`).style.marginTop = "2px";
            }

            this.chartService.pieChartInit(className, pieChartData, chartObj);

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              selectedFilter: chartObj.ChartParameterValue
            });

            //trigger change event on new chart
            if (pieChartFilterData != null && pieChartFilterData.length && state.mode) {
              const event = new Event('change');
              chartarea[0].querySelector(`.${className}`).dispatchEvent(event);
            }

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

    this.resizeContainer(container);

  }

  getPieChartData(dataForChart: any, className: any, container: any, state: any) {
    this.subs.add(
      this.chartService.getChartData(dataForChart).subscribe(
        data => {
          if (data.isSuccess) {
            const { pieChartModel } = data.data;
            let pieChartData = pieChartModel.filter(x => x.y != 0 && x.y != "" && x.y != null);
            const { containerChartObj: chartObj, text } = state;

            container.setState({
              text: text,
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
    const className = this.getUniqueClassName(cl, 'line');
    const filterDivCl = "filterli" + className;
    const { selectedFilter, containerChartObj: chartObj } = state;
    chartObj.ChartParameterValue = (selectedFilter != null && selectedFilter != "") ? selectedFilter : this.defaultFilterVal;

    this.subs.add(
      this.chartService.getChartData(chartObj).subscribe(
        data => {
          if (data.isSuccess) {
            const { lineChartModel: lineChartData, chartFilterModel: lineChartFilterData, startDate, endtDate } = data.data;
            const xaxis = { 'start': startDate, 'end': endtDate };

            const chartarea = container.getElement().html(`<div class="row" style="width:100%; height:100%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div> <div id="${className}" style="position:absolute; width:100%; height:100%;"></div> </div></div>`);

            if (lineChartFilterData != null) {
              this.createFilterDropdown(lineChartFilterData[0]['filterString'], { className, filterDivCl, selectedFilter });
              chartarea[0].querySelector(`.${className}`).addEventListener("change", (event) => this.renderFilteredChart(className, container, state, 'line'));
              chartarea[0].querySelector('.row').style.height = "94%";
              chartarea[0].querySelector(`#${className}`).style.marginTop = "2px";
            }

            this.chartService.lineChartInit(className, lineChartData, xaxis, null, null);

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              xaxis: xaxis,
              selectedFilter: chartObj.ChartParameterValue
            });

            //trigger change event on new chart
            if (lineChartFilterData != null && lineChartData.length && state.mode) {
              const event = new Event('change');
              chartarea[0].querySelector(`.${className}`).dispatchEvent(event);
            }

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

    this.resizeContainer(container);

  }

  getLineChartData(dataForChart: any, className: any, container: any, state: any) {
    this.subs.add(
      this.chartService.getChartData(dataForChart).subscribe(
        data => {
          if (data.isSuccess) {
            const { lineChartModel: lineChartData, startDate, endtDate } = data.data;
            const xaxis = { 'start': startDate, 'end': endtDate }
            const { containerChartObj: chartObj, text } = state;

            container.setState({
              text: text,
              containerChartObj: chartObj,
              xaxis: xaxis,
              selectedFilter: dataForChart.ChartParameterValue
            });

            this.chartService.lineChartInit(className, lineChartData, xaxis);
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }


  renderBarChartIfStatesaved(container: any, state: any, cl: any = null) {
    const className = this.getUniqueClassName(cl, 'bar');
    const filterDivCl = "filterbar" + className;

    const { selectedFilter, containerChartObj: chartObj } = state;
    chartObj.ChartParameterValue = (selectedFilter != null && selectedFilter != "") ? selectedFilter : this.defaultFilterVal;

    let getChartData;
    if (chartObj.ddChartId != undefined) {
      getChartData = this.chartService.drillDownStackedBarChartData(chartObj)
    } else {
      getChartData = this.chartService.getChartData(chartObj);
    }

    this.subs.add(
      getChartData.subscribe(
        data => {
          if (data.isSuccess) {
            const { data: barChartData, data: { chartFilterModel: barChartFilterData } } = data;
            const chartarea = container.getElement().html(`<div class="row" style="width:100%; height:100%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div> <div id="${className}" style="position:absolute; width:100%; height:100%;"></div> </div></div>`);

            if (barChartFilterData != null) {
              this.createFilterDropdown(barChartFilterData[0]['filterString'], { className, filterDivCl, selectedFilter });
              chartarea[0].querySelector(`.${className}`).addEventListener("change", (event) => this.renderFilteredChart(className, container, state, 'bar'));
              chartarea[0].querySelector('.row').style.height = "94%";
              chartarea[0].querySelector(`#${className}`).style.marginTop = "2px";
            }

            this.chartService.barChartInit(className, barChartData, chartObj);

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              selectedFilter: chartObj.ChartParameterValue
            });

            //trigger change event on new chart
            if (barChartFilterData != null && barChartFilterData.length && state.mode) {
              const event = new Event('change');
              chartarea[0].querySelector(`.${className}`).dispatchEvent(event);
            }

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

    this.resizeContainer(container);

  }


  getBarChartData(dataForChart: any, className: any, container: any, state: any) {
    this.subs.add(
      this.chartService.getChartData(dataForChart).subscribe(
        data => {
          if (data.isSuccess) {
            let barChartData = data.data;
            const { containerChartObj: chartObj, text } = state;

            container.setState({
              text: text,
              containerChartObj: chartObj,
              selectedFilter: dataForChart.ChartParameterValue
            });

            this.chartService.barChartInit(className, barChartData, dataForChart);

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }



  renderGroupBarChartIfStatesaved(container: any, state: any, cl: any = null) {
    let className = this.getUniqueClassName(cl, 'groupbar');
    className = this.helper.replaceAll(className, "/", "");
    const filterDivCl = "filterbar" + className;

    const { selectedFilter, containerChartObj: chartObj } = state;
    chartObj.ChartParameterValue = (selectedFilter != null && selectedFilter != "") ? selectedFilter : this.defaultFilterVal;

    this.subs.add(
      this.chartService.getChartData(chartObj).subscribe(
        data => {
          if (data.isSuccess) {
            const { data: chartData, data: { chartFilterModel: chartFilterData } } = data;
            const chartarea = container.getElement().html(`<div class="row" style="width:100%; height:100%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div> <div id="${className}" style="position:absolute; width:100%; height:100%;"></div> </div></div>`);

            if (chartFilterData != null) {
              this.createFilterDropdown(chartFilterData[0]['filterString'], { className, filterDivCl, selectedFilter });
              chartarea[0].querySelector(`.${className}`).addEventListener("change", (event) => this.renderFilteredChart(className, container, state, 'groupbar'));
              chartarea[0].querySelector('.row').style.height = "94%";
              chartarea[0].querySelector(`#${className}`).style.marginTop = "2px";
            }

            this.chartService.groupBarChartInit(className, chartData);

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              selectedFilter: chartObj.ChartParameterValue
            });

            //trigger change event on new chart
            if (chartFilterData != null && chartFilterData.length && state.mode) {
              const event = new Event('change');
              chartarea[0].querySelector(`.${className}`).dispatchEvent(event);
            }

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

    this.resizeContainer(container);
  }


  getGroupBarChartData(dataForChart: any, className: any, container: any, state: any) {
    this.subs.add(
      this.chartService.getChartData(dataForChart).subscribe(
        data => {
          if (data.isSuccess) {
            const chartData = data.data;
            const { containerChartObj: chartObj, text } = state;

            container.setState({
              text: text,
              containerChartObj: chartObj,
              selectedFilter: dataForChart.ChartParameterValue
            });

            this.chartService.groupBarChartInit(className, chartData);
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
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


  handleChartClick(data: gridDataEventType) {
    if (typeof data == 'object' && data.chartType != undefined) {
      this.openChartOrGrid(data);
    }
  }


  openChartOrGrid(data: gridDataEventType) {
    const { chartRef: chartEvent, chartObject: parentChartObj } = data;
    if (parentChartObj && parentChartObj.ddChartID) {
      const params = {
        "chartName": `${parentChartObj.chartName} (${chartEvent.options.name})`,
        "chartType": 4,
        "ChartParameterValue": parentChartObj?.ChartParameterValue,
        "ddChartId": parentChartObj.ddChartID,
        "parantChartId": parentChartObj.chartID,
        "xAxisValue": chartEvent.options.name,
        "seriesId": chartEvent.options.seriesId,
        "color": chartEvent.color
      }
      this.renderDrillDownChart(chartEvent, params)
    } else {
      if (parentChartObj.dataSP) {
        this.outputDataForGrid(data);
      }
    }
  }

  outputDataForGrid(data: gridDataEventType) {
    if (data && typeof data == 'object') {
      const { chartType, chartRef: chartEvent, chartObject: parentChartObj } = data;
      let selectedBarChartXasis: any;
      if (chartType == 'pie') {
        selectedBarChartXasis = {
          "ddChartId": parentChartObj.ddChartId != undefined ? parentChartObj.ddChartId : parentChartObj.ddChartID,
          "parantChartId": parentChartObj.parantChartId != undefined ? parentChartObj.parantChartId : parentChartObj.chartID,
          "xAxisValue": chartEvent.options.name,
          "seriesId": chartEvent.options.seriesId,
          "chartName": parentChartObj.chartName,
          "ChartParameterValue": parentChartObj?.ChartParameterValue,
        }
      }

      if (chartType == 'bar') {
        selectedBarChartXasis = {
          "ddChartId": parentChartObj.ddChartId != undefined ? parentChartObj.ddChartId : parentChartObj.ddChartID,
          "parantChartId": parentChartObj.parantChartId != undefined ? parentChartObj.parantChartId : parentChartObj.chartID,
          "xAxisValue": chartEvent.category,
          "seriesId": parentChartObj.seriesId,
          "chartName": parentChartObj.chartName,
          "ChartParameterValue": parentChartObj?.ChartParameterValue,
        }
      }

      this.chartService.checkDrillDownChartGridDataIsNull(selectedBarChartXasis).subscribe(
        data => {
          if (data.isSuccess) {
            this.gridDataEvent.emit(selectedBarChartXasis);
          } else this.alertService.error('No data found.')

        }
      );
    }

  }

  renderDrillDownChart($event: any, chartData: any) {
    this.drawChartObj = chartData;
    let cl = Math.random();
    let compNo = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
    let thisContainer = $($event.series.chart.container);

    let newItemConfig = {
      title: chartData.chartName,
      type: 'component',
      componentName: 'testComponent',
      componentState: { text: 'Component' + compNo }
    };

    thisContainer.closest(".lm_stack").find('.lm_selectable').click();
    if (this.myLayout.selectedItem != undefined) {
      this.myLayout.selectedItem.addChild(newItemConfig);
    }
  };


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
