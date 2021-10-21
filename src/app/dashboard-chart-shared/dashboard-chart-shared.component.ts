import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, HostListener } from '@angular/core';
import { SubSink } from 'subsink';
import { ChartComponentModel } from '../_models';
import { AlertService, HelperService, ChartService } from '../_services';
import { delay } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
  chartNamesEnergy: any = [];
  chartNamesTasks: any = [];
  chartNamesHnS: any = [];
  chartNamesWOPM: any = [];
  chartNamesSIM: any = [];
  chartNamesSurvey: any = [];
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
  numberOfChartCanBeAdded = 100;
  chartRenderMap = new Map();
  checkLayoutResized = false;
  chartDivHeight = window.innerHeight - 200;
  hideChart = false;
  uriEncodedPortalName = '';

  constructor(
    private alertService: AlertService,
    private helper: HelperService,
    private chartService: ChartService
  ) {
    //update notification on top
    helper.updateNotificationOnTop();
  }

  onChange(height) {
    if (height > (window.innerHeight - 200)) {
      const contDivWidth = document.querySelector('.cont').clientWidth;
      this.myLayout.updateSize(contDivWidth - 10, height);
    }
  }

  ngOnDestroy() {
    //EMPTY CHART CLICK SUBSCRIPTION ON COMPONENT LEAVE
    this.chartService.changeChartInfo([]);
    this.subs.unsubscribe();
    if (this.myLayout) {
      this.myLayout.destroy()
    }
  }

  ngOnInit(): void {
    this.uriEncodedPortalName = encodeURIComponent(this.portalName);
    //UPDATE LAYOUT HEIGHT ON LOAD
    this.updateChartLayoutSize(true);

    //SUBSCRIBE CHART CLICK
    this.subs.add(
      this.chartService.chartInfo.subscribe(data => this.handleChartClick(data))
    )

    //GET MAXIMUM NUMBER OF CHART FOR THE DASHBOARD
    this.subs.add(
      this.chartService.getUserChartByDashboard(this.uriEncodedPortalName).subscribe(
        data => {
          if (data.isSuccess) {
            if (data.data.length) {
              this.numberOfChartCanBeAdded = data.data[0].numberOfChart;
              //this.alertService.success(this.numberOfChartCanBeAdded.toString())
            }
            else {
              // this.alertService.success(this.numberOfChartCanBeAdded.toString())
            }
          }
        }
      )
    )

    //GET CHART AND ITS DATA
    this.subs.add(
      this.chartService.getUserChartData(this.currentUser.userId, this.uriEncodedPortalName)
        .pipe(delay(500))//DELAY 500 MILISECOND
        .subscribe(
          async data => {
            const { chartData = null, dashboard } = data.data;
            if (chartData != null) {
              this.dashboardName = dashboard;
              this.savedState = chartData.chartData;
              this.myLayout = new GoldenLayout(JSON.parse(this.savedState), $('#layoutContainer'));
            } else {
              this.savedState = null
              this.myLayout = new GoldenLayout(this.config, $('#layoutContainer')); // ACTUAL OBJECT
            }

            //GET CHART LIST BY PORTAL NAME
            const chartList = await this.chartService.getChartsList(this.portalNameForChart, this.currentUser.userId).toPromise();
            if (!chartList.isSuccess) {
              this.alertService.error(chartList.message);
              return;
            }

            this.chartNames = chartList.data;
            this.setUpChartAreas();

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
                } else if (text == "Component5") {
                  if (this.chartNames[3] != undefined) {
                    // console.log(container)
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
              this.afterMyLayoutInit();
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

  afterMyLayoutInit() {
    // this.myLayout.on("stackCreated", item => {
    //   if (item && item.type == 'stack') {
    //     setTimeout(() => {
    //       let layoutManager = item.layoutManager;

    //       item.config.height = 35;
    //       let layoutHeight = layoutManager.height + 250;
    //       const containerHeight = layoutHeight + 100
    //       $('#layoutContainer').css({ 'height': `${containerHeight}px` });
    //       layoutManager.height = layoutHeight;
    //       const allRows = layoutManager.root.contentItems[0].contentItems;
    //       const prevFirstRowPix = ((containerHeight - 470) * allRows[0].config.height) / 100;
    //       const currerPer = (prevFirstRowPix * 100) / (containerHeight);
    //       allRows[0].config.height = currerPer;

    //       layoutManager.updateSize();

    //     }, 200);
    //   }
    // })


    this.myLayout.on("stateChanged", item => {
      if (item == undefined) return

      let origin = item.origin;
      let layoutManager = origin.layoutManager;
      let layoutWidth = layoutManager.width;
      let layoutHeight = layoutManager.height;
      let comp = this;

      // console.log(item)

      const emptyContainer = origin.layoutManager.root.getItemsById("hiddenContainer");
      if ((!this.hideChart && this.savedState != null) || emptyContainer && emptyContainer[0].config && emptyContainer[0].config.height != 0) {
        this.hideChart = true;
        emptyContainer[0].config.height = 0;
        emptyContainer[0].element.hide();
        if (this.savedState != null) {
          layoutHeight = JSON.parse(this.savedState).layoutHeight
        }
        origin.layoutManager.height = layoutHeight;
        $('#layoutContainer').css({ 'height': `${layoutHeight}px` });

        if (this.savedState != null) {
          setTimeout(() => {
            origin.layoutManager.updateSize(layoutWidth, layoutHeight);
          }, 1000);
        } else {
          origin.layoutManager.updateSize(layoutWidth, layoutHeight);
        }
      }


      if (origin._dimension && origin._dimension == 'height') {
        const splitters = origin._splitter;

        let height = 0;
        let top;

        for (let i = 0; i < splitters.length; i++) {
          if (splitters[i]) {

            splitters[i]._dragListener.on('dragStart', function (item) {
              height = 0
              layoutWidth = layoutManager.width;
              layoutHeight = layoutManager.height;
            })

            splitters[i]._dragListener.on('drag', function (item) {
              height += 2

              top = comp.helper.replaceAll(splitters[i].element.css('top'), "px", "");
              if (top) top = parseInt(top)

            })

            splitters[i]._dragListener.on('dragStop', function (item) {
              const nextRow = splitters[i].element.next();

              // console.log(top)
              // console.log(height)
              // console.log(layoutManager._findAllStackContainers())
              // console.log(layoutManager)
              // console.log(layoutManager.root.config.content[0])

              let currentHeight;
              if (top >= 0) {
                if (top > height) height = top;
                if (top == 0) height + 170;
                currentHeight = layoutHeight + height;

                // console.log(nextRow.is(":visible"))

                if (!nextRow.is(":visible")) {
                  const allContainers = layoutManager._findAllStackContainers();

                  const lastContainer = allContainers[allContainers.length - 2];//-2 is for skip last hidden container
                  const lastContainerHeightPer = (height * 100) / currentHeight;
                  const lastContainerPrevHeight = lastContainer.config.height;
                  lastContainer.config.height = lastContainerPrevHeight + lastContainerHeightPer;

                  if (lastContainer.config.height > 50) {
                    lastContainer.config.height = 50
                  }
                }

              } else {
                height = top;
                currentHeight = layoutHeight + height;
              }

              $('#layoutContainer').css({ 'height': `${currentHeight}px` });
              layoutManager.height = currentHeight;
              origin.layoutManager.updateSize()

            })
          }

        }

      } else {
        origin.layoutManager.updateSize()
      }

    });
  }

  setUpChartAreas() {

    this.chartNames.forEach(element => {
      if (element.dashboard == 'Energy') {
        this.chartNamesEnergy.push(element);
      }
      if (element.dashboard == 'Tasks') {
        this.chartNamesTasks.push(element);
      }
      if (element.dashboard == 'Health&Safety') {
        this.chartNamesHnS.push(element);
      }
      if (element.dashboard == 'WorksOrder') {
        this.chartNamesWOPM.push(element);
      }
      if (element.dashboard == 'Servicing') {
        this.chartNamesSIM.push(element);
      }
      if (element.dashboard == 'Surveying') {
        this.chartNamesSurvey.push(element);
      }

    });

  }

  updateChartLayoutSize(onlyLayoutHeight = false) {
    const innerHeight = window.innerHeight - 200;
    this.goldenLayoutStyle.height = `${innerHeight}px`;
    setTimeout(() => this.goldenLayoutStyle.minHeight = `${innerHeight + 6}px`, 4500);

    if (!onlyLayoutHeight) {
      $(".lm_goldenlayout").css("width", "100%");
      $('.lm_goldenlayout > .lm_column').css("width", "100%");
      setTimeout(() => { this.myLayout.updateSize() }, 300);
    }

  }


  renderChartIfStateSaved(container: any, state: any) {
    let currentStateChart = state.containerChartObj;
    if (currentStateChart) {
      // console.log(currentStateChart)
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

  }


  // RENDER CHART TYPE ON CLICK
  renderChartTypes(chartObj: any, container: any, state: any) {
    let selectedFiler: any = ''

    if (chartObj.chartParameters == 1) {
      if (chartObj.ChartParameterValue) selectedFiler = chartObj.ChartParameterValue;
      else {
        selectedFiler = this.defaultFilterVal
      };
    } else {
      selectedFiler = this.defaultFilterVal;
    }

    if (selectedFiler == this.defaultFilterVal && this.portalName == "Energy") {
      selectedFiler = 10121212;//random
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


  renderChart(side: string, chartData: any) {
    if ($('.lm_vertical').length == 0 && $('.lm_horizontal').length == 0 && $('.lm_item.lm_row').length == 1) {
      this.createNewChart(chartData);
    } else {
      const numberOfCharts = document.querySelectorAll('.lm_item_container').length - 1; //-1 is for hidden chart;
      if (numberOfCharts >= this.numberOfChartCanBeAdded) {
        let mes = 'Only one chart can be added.'
        if (this.numberOfChartCanBeAdded > 1) {
          mes = ` A maximum of ${this.numberOfChartCanBeAdded} charts can be added`
        }
        this.alertService.error(mes)
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
  createNewChart(chartData: any) {
    this.myLayout.destroy();
    this.drawChartObj = chartData;
    let cl = Math.random();
    let compNo = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
    let config = {
      settings: {
        selectionEnabled: true
      },
      content: [{
        type: 'column',
        content: [{
          height: 30,
          isClosable: true,
          type: 'row',
          content: [{
            height: 30,
            type: 'component',
            componentName: 'testComponent',
            componentState: { text: 'Component' + compNo },
            title: chartData.chartName,
          }]
        },
        {
          type: 'row',
          id: "hiddenContainer",
          content: [{
            isClosable: false,
            height: 0,
            type: 'component',
            componentName: 'testComponent',
            componentState: { text: 'Component5' },
            title: ' ',
          }]
        }]
      }]


      //   content: [{
      //     type: 'row',
      //     isClosable: false,
      //     content: [{
      //       height: 30,
      //       title: chartData.chartName,
      //       type: 'component',
      //       componentName: 'testComponent',
      //       componentState: { text: 'Component' + compNo }
      //     }]
      //   },
      // ]
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
        } else if (state.text == "Component5") {

        }
      } else if (this.drawChartObj == null && this.savedState != null) {
        this.renderChartIfStateSaved(container, state);
      } else if (this.drawChartObj != null) {
        this.renderChartTypes(this.drawChartObj, container, state);
      }

    }

    this.myLayout.registerComponent('testComponent', createDefaultCharts);
    this.myLayout.init();
    this.afterMyLayoutInit();
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
      let selectOpt = (selectedFilter == filterString.value) ? "selected" : "";
      optHtml += (`<option ${selectOpt} value="${filterString.value}">${filterString.key}</option>`);
    }
    selectElm.html(optHtml);
    $("." + filterDivCl).html(selectElm);
  }

  renderFilteredChart(className, container, state, chartType) {
    if (this.chartRenderMap.has(className)) {
      const chartToDestroy = this.chartRenderMap.get(className);
      if (chartToDestroy) {
        chartToDestroy.destroy();
        this.chartRenderMap.delete(className);
      }
    }

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
    if (chartType == 'groupbar') this.getGroupBarChartData(dataForChart, className, container, state);

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

            let chart = this.chartService.pieChartInit(className, pieChartData, chartObj);
            this.chartRenderMap.set(className, chart);

            if (pieChartFilterData != null) {
              this.createFilterDropdown(pieChartFilterData, { className, filterDivCl, selectedFilter });

              chartarea[0].querySelector(`.${className}`).addEventListener("change", (event) => {
                this.renderFilteredChart(className, container, state, 'pie')
              });

              chartarea[0].querySelector('.row').style.height = "94%";
              chartarea[0].querySelector(`#${className}`).style.marginTop = "2px";
            }



            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              selectedFilter: chartObj.ChartParameterValue
            });

            //trigger change event on new chart
            if (pieChartFilterData != null && state.mode) {
              const checkSelectedParamExist = pieChartFilterData.find(x => x.value == chartObj.ChartParameterValue);
              if (!checkSelectedParamExist) {
                const event = new Event('change');
                chartarea[0].querySelector(`.${className}`).dispatchEvent(event);
              }

            }

            this.resizeChart(container, className);

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

    // this.resizeContainer(container);

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

            let chart = this.chartService.pieChartInit(className, pieChartData, chartObj, null, null, true);
            this.chartRenderMap.set(className, chart);
            this.resizeChart(container, className);

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

            let chart = this.chartService.lineChartInit(className, lineChartData, xaxis, null, null);
            this.chartRenderMap.set(className, chart);

            if (lineChartFilterData != null) {
              this.createFilterDropdown(lineChartFilterData, { className, filterDivCl, selectedFilter });

              chartarea[0].querySelector(`.${className}`).addEventListener("change", (event) => {
                this.renderFilteredChart(className, container, state, 'line')
              });

              chartarea[0].querySelector('.row').style.height = "94%";
              chartarea[0].querySelector(`#${className}`).style.marginTop = "2px";
            }

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              xaxis: xaxis,
              selectedFilter: chartObj.ChartParameterValue
            });


            //trigger change event on new chart
            if (lineChartFilterData != null && state.mode) {
              const checkSelectedParamExist = lineChartFilterData.find(x => x.value == chartObj.ChartParameterValue);
              if (!checkSelectedParamExist) {
                const event = new Event('change');
                chartarea[0].querySelector(`.${className}`).dispatchEvent(event);
              }
            }

            this.resizeChart(container, className);

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

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

            let chart = this.chartService.lineChartInit(className, lineChartData, xaxis);
            this.chartRenderMap.set(className, chart);
            this.resizeChart(container, className);

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

            let chart = this.chartService.barChartInit(className, barChartData, chartObj);
            this.chartRenderMap.set(className, chart);

            if (barChartFilterData != null) {
              this.createFilterDropdown(barChartFilterData, { className, filterDivCl, selectedFilter });
              chartarea[0].querySelector(`.${className}`).addEventListener("change", (event) => this.renderFilteredChart(className, container, state, 'bar'));
              chartarea[0].querySelector('.row').style.height = "94%";
              chartarea[0].querySelector(`#${className}`).style.marginTop = "2px";
            }

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              selectedFilter: chartObj.ChartParameterValue
            });

            //trigger change event on new chart
            if (barChartFilterData != null && state.mode) {
              const checkSelectedParamExist = barChartFilterData.find(x => x.value == chartObj.ChartParameterValue);
              if (!checkSelectedParamExist) {
                const event = new Event('change');
                chartarea[0].querySelector(`.${className}`).dispatchEvent(event);
              }
            }

            this.resizeChart(container, className);

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

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

            let chart = this.chartService.barChartInit(className, barChartData, dataForChart);
            this.chartRenderMap.set(className, chart);
            this.resizeChart(container, className);

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

            let chart = this.chartService.groupBarChartInit(className, chartData);
            this.chartRenderMap.set(className, chart);

            if (chartFilterData != null) {
              this.createFilterDropdown(chartFilterData, { className, filterDivCl, selectedFilter });
              chartarea[0].querySelector(`.${className}`).addEventListener("change", (event) => this.renderFilteredChart(className, container, state, 'groupbar'));
              chartarea[0].querySelector('.row').style.height = "94%";
              chartarea[0].querySelector(`#${className}`).style.marginTop = "2px";
            }

            container.setState({
              text: state.text,
              containerChartObj: chartObj,
              selectedFilter: chartObj.ChartParameterValue
            });

            //trigger change event on new chart
            if (chartFilterData != null && state.mode) {
              const checkSelectedParamExist = chartFilterData.find(x => x.value == chartObj.ChartParameterValue);
              if (!checkSelectedParamExist) {
                const event = new Event('change');
                chartarea[0].querySelector(`.${className}`).dispatchEvent(event);
              }
            }

            this.resizeChart(container, className);

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )

    // this.resizeContainer(container);
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

            let chart = this.chartService.groupBarChartInit(className, chartData);
            this.chartRenderMap.set(className, chart);
            this.resizeChart(container, className);

          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }


  // resizeContainer(container) {
  //   container.on('resize', () => {
  //     setTimeout(() => {
  //       window.dispatchEvent(new Event('resize'));
  //     }, 400);
  //   })
  // }

  resizeChart(container, className) {
    container.on('resize', () => {
      if (className != undefined) {
        setTimeout(() => {
          if (this.chartRenderMap.has(className)) {
            const chart = this.chartRenderMap.get(className);
            const previousElem = $(`.${className}`).prev();
            let hightReduce = 0;
            if (previousElem.prevObject.is("select")) hightReduce = 20
            if (chart) chart.setSize(container.width, container.height - hightReduce)
          }
        }, 100);
      }



      // let contDivWidth = document.querySelector('.cont').clientWidth;
      // let contDivHeight = document.querySelector('.cont').clientHeight;
      // let splitter = document.querySelectorAll('.lm_vertical');

      // let totalHeight = 360 * splitter.length + 1

      // if (!this.checkLayoutResized) {
      //   this.checkLayoutResized = true;
      //   setTimeout(() => {
      //     if (totalHeight > 746 && splitter.length > 2) {
      //       this.myLayout.updateSize(contDivWidth - 10, (totalHeight + 220));
      //     } else {
      //       this.myLayout.updateSize(contDivWidth - 10, contDivHeight);
      //     }

      //     setTimeout(() => this.checkLayoutResized = false, 2000);
      //   }, 1000);
      // }

    })
  }


  saveChartsState() {
    if ($('.lm_vertical').length == 0 && $('.lm_horizontal').length == 0 && $('.lm_item.lm_row').length == 1) {
      this.alertService.error("There is no state to save.");
      return
    }
    let state = this.myLayout.toConfig();
    state.layoutHeight = this.myLayout.height;
    const chartState = { UserId: this.currentUser.userId, ChartData: JSON.stringify(state), dashboard: this.uriEncodedPortalName }
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

  deleteChartState() {
    this.subs.add(
      this.chartService.DeleteChartState(this.uriEncodedPortalName).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success("Chart state deleted successfully.")
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
        "color": chartEvent.color,
        // "dataSP": parentChartObj.dataSP,
      }
      this.renderDrillDownChart(chartEvent, params)
    } else {
      if (parentChartObj.dataSP) {
        //if dataSP is not blank and ddChartid is 0 then set ddchartid as actual chart id
        if (parentChartObj.ddChartID == 0) {
          parentChartObj.ddChartId = parentChartObj.chartID
        }
        this.outputDataForGrid(data);
      } else {
        const { ddChartId } = parentChartObj;
        if (ddChartId) {
          this.chartService.getChartById(ddChartId).subscribe(
            datachart => {
              if (datachart.isSuccess) {
                const chartData = datachart.data;
                if (chartData.dataSP) {
                  this.outputDataForGrid(data);
                }
              }
            }
          )
        }

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
