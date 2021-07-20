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

  ngOnInit() { }

  gridDataEvent(event) {
    if (event && typeof event == 'object') {
      const { chartType, chartRef: chartEvent, chartObject: parentChartObj } = event;
      if (chartType == 'pie') {
        this.selectedBarChartXasis = {
          "ddChartId": parentChartObj.ddChartId != undefined ? parentChartObj.ddChartId : parentChartObj.ddChartID,
          "parantChartId": parentChartObj.parantChartId != undefined ? parentChartObj.parantChartId : parentChartObj.chartID,
          "xAxisValue": chartEvent.options.name,
          "seriesId": chartEvent.options.seriesId,
          "chartName": parentChartObj.chartName
        }
      }

      if (chartType == 'bar') {
        this.selectedBarChartXasis = {
          "ddChartId": parentChartObj.ddChartId != undefined ? parentChartObj.ddChartId : parentChartObj.ddChartID,
          "parantChartId": parentChartObj.parantChartId != undefined ? parentChartObj.parantChartId : parentChartObj.chartID,
          "xAxisValue": chartEvent.category,
          "seriesId": parentChartObj.seriesId,
          "chartName": parentChartObj.chartName
        }
      }

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

  // renderChartIfStateSaved(container: any, state: any, classRefer: any) {
  //   let currentStateChart = state.containerChartObj
  //   if (currentStateChart.chartType == 3) {
  //     let cl = "";
  //     if (state.text == "Component1") {
  //       cl = "pi111"; // default chart class start string
  //     } else if (state.text == "Component2") {
  //       cl = "pi22"; // default chart class start string
  //     }
  //     classRefer.renderPieChartIfStatesaved(container, state, classRefer, currentStateChart.chartName + cl);
  //   } else if (currentStateChart.chartType == 1) {
  //     classRefer.renderLineChartIfStatesaved(container, state, classRefer, currentStateChart.chartName);
  //   } else if (currentStateChart.chartType == 4) {
  //     classRefer.renderBarChartIfStatesaved(container, state, classRefer, currentStateChart.chartName)
  //   } else if (currentStateChart.chartType == 5) {
  //     classRefer.renderGroupBarChartIfStatesaved(container, state, classRefer, currentStateChart.chartName)
  //   }
  // }


  // // rendar chart types on click
  // renderChartTypes(chartObj: any, classRefer: any, container: any, state: any, cl = null) {
  //   chartObj.ChartParameterValue = chartObj.chartParameters == 1 ? classRefer.defaultFilterVal : "";
  //   if (chartObj.chartType == 3) {
  //     //classRefer.groupBarChart(container, state, chartObj, chartObj.chartName);
  //     classRefer.pieChart(container, state, chartObj, chartObj.chartName + cl);
  //   } else if (chartObj.chartType == 1) {
  //     classRefer.lineChart(container, state, chartObj, chartObj.chartName);
  //   } else if (chartObj.chartType == 4) {
  //     chartObj.ChartParameterValue = classRefer.defaultFilterVal;
  //     classRefer.barChart(container, state, chartObj, chartObj.chartName);
  //   } else if (chartObj.chartType == 5) {
  //     chartObj.ChartParameterValue = classRefer.defaultFilterVal;
  //     classRefer.groupBarChart(container, state, chartObj, chartObj.chartName);
  //   }
  // }


  // // create new chart when all tabs are closed
  // createNewChart($event: any, side: string, chartData: any) {
  //   this.myLayout.destroy();
  //   const comp = this;
  //   this.drawChartObj = chartData;
  //   let cl = Math.random();
  //   let compNo = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   let config = {
  //     settings: {
  //       selectionEnabled: true
  //     },
  //     content: [{
  //       type: 'row',
  //       isClosable: false,
  //       content: [{
  //         title: chartData.chartName,
  //         type: 'component',
  //         componentName: 'testComponent',
  //         componentState: { text: 'Component' + compNo }
  //       }]
  //     }]
  //   };
  //   this.myLayout = new GoldenLayout(config, $('#layoutContainer')); // actual object

  //   let createDefaultCharts = function (container: any, state: any) {
  //     if (comp.drawChartObj == null && comp.savedState == null) {
  //       if (state.text == "Component1") {
  //         container.setTitle(comp.chartNames[0].chartName)
  //         let cl = "pi111"; // default chart class start string
  //         comp.renderChartTypes(comp.chartNames[0], comp, container, state, cl);
  //       } else if (state.text == "Component2") {
  //         let cl = "pi22"; // default chart class start string
  //         container.setTitle(comp.chartNames[1].chartName)
  //         comp.renderChartTypes(comp.chartNames[1], comp, container, state, cl);
  //       } else if (state.text == "Component3") {
  //         container.setTitle(comp.chartNames[2].chartName)
  //         comp.renderChartTypes(comp.chartNames[2], comp, container, state);
  //       }
  //     } else if (comp.drawChartObj == null && comp.savedState != null) {
  //       comp.renderChartIfStateSaved(container, state, comp);
  //     } else if (comp.drawChartObj != null) {
  //       comp.renderChartTypes(comp.drawChartObj, comp, container, state);
  //     }
  //   }

  //   this.myLayout.registerComponent('testComponent', createDefaultCharts);
  //   this.myLayout.init();

  // }

  // renderChart($event: any, side: string, chartData: any) {
  //   if ($('.lm_vertical').length == 0 && $('.lm_horizontal').length == 0 && $('.lm_selectable').length == 0) {
  //     this.createNewChart($event, side, chartData);
  //   } else {
  //     this.drawChartObj = chartData;
  //     let cl = Math.random();
  //     let compNo = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //     let newItemConfig = {
  //       title: chartData.chartName,
  //       type: 'component',
  //       componentName: 'testComponent',
  //       componentState: { text: 'Component' + compNo }
  //     };
  //     if ($('.lm_horizontal').length > 0 && (side === "left" || side === "right")) {
  //       if (side === "left") {
  //         $(".lm_horizontal").first().prev(".lm_stack").find('.lm_selectable').click();
  //       } else {
  //         $(".lm_horizontal").first().next(".lm_stack").find('.lm_selectable').click();
  //       }
  //     } else if ($('.lm_horizontal').length == 0 && (side === "left" || side === "right")) {
  //       $("#layoutContainer .lm_stack").first().find('.lm_selectable').click();
  //     } else if ($('.lm_vertical').length > 0 && side === "bottom") {
  //       $(".lm_vertical").first().next(".lm_stack").find('.lm_selectable').click();
  //     } else if ($('.lm_vertical').length == 0 && side === "bottom") {
  //       $("#layoutContainer .lm_stack").first().find('.lm_selectable').click();
  //     }
  //     this.myLayout.selectedItem.addChild(newItemConfig);
  //   }

  // };


  // renderLineChartIfStatesaved(container: any, state: any, classRefer: any, cl: any = null) {
  //   cl = cl.split(" ")[0] + Math.random();
  //   let className = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   className = this.helper.replaceAll(className, ".", "")
  //   let filterDivCl = "filterli" + className;
  //   let chartObj = state.containerChartObj;

  //   chartObj.ChartParameterValue = (state.selectedFilter != null && state.selectedFilter != "") ? state.selectedFilter : classRefer.defaultFilterVal;
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(chartObj).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let lineChartData = data.data.lineChartModel;
  //           let lineChartFilterData = data.data.chartFilterModel;
  //           let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px; margin-bottom:10px;" class="${className}">`);
  //           let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };
  //           if (lineChartFilterData != null) {
  //             let optHtml = "";
  //             for (var val in lineChartFilterData[0]['filterString']) {
  //               let v = lineChartFilterData[0]['filterString'][val]
  //               let selectOpt = (state.selectedFilter == v) ? "selected" : "";
  //               optHtml += (`<option ${selectOpt} value="${v}">${v}</option>`);
  //             }
  //             selectElm.html(optHtml);
  //             dynamicCss = { parentDiv: 94, childDiv: 98, childDivMt: 6 };
  //           }

  //           let xaxis = {
  //             'start': data.data.startDate,
  //             'end': data.data.endtDate
  //           }

  //           container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div> <div id="${className}" style="position:absolute; width:100%; height:${dynamicCss.childDiv}%;"></div> </div></div>`);
  //           let lineChart = this.lineChartInit(null, null, className, lineChartData, xaxis);

  //           container.setState({
  //             text: state.text,
  //             //chartData: lineChartData,
  //             containerChartObj: chartObj,
  //             xaxis: xaxis,
  //             //filters: (lineChartFilterData != null) ? "filterString" : null,
  //             selectedFilter: chartObj.ChartParameterValue
  //           });


  //           if (lineChartFilterData != null) {
  //             $("." + filterDivCl).html(selectElm);
  //           }

  //           $(document).on('change', '.' + className, function () {
  //             let val = $(this).val();
  //             let chartName = $(".line" + className).val();
  //             let dataForChart = classRefer.chartNames.find(x => x.chartName == chartName);
  //             dataForChart.ChartParameterValue = val;
  //             classRefer.getLineChartData(dataForChart, className, container, state, chartObj);
  //           });
  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )

  //   container.on('resize', function () {
  //     setTimeout(() => {
  //       window.dispatchEvent(new Event('resize'));
  //     }, 400);
  //   })

  // }



  // lineChart(container: any, state: any, chartObj: any = null, cl = null) {
  //   let comp = this;
  //   cl = cl.split(" ")[0] + Math.random();
  //   let className = `line${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   className = this.helper.replaceAll(className, ".", "")
  //   let filterDivCl = "filterli" + className;
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(chartObj).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let lineChartData = data.data.lineChartModel;
  //           let lineChartFilterData = data.data.chartFilterModel;
  //           let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px; margin-bottom:10px;" class="${className}">`);
  //           let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };
  //           if (lineChartFilterData != null) {
  //             let optHtml = "";
  //             for (var val in lineChartFilterData[0]['filterString']) {
  //               let v = lineChartFilterData[0]['filterString'][val]
  //               optHtml += (`<option value="${v}">${v}</option>`);
  //             }
  //             selectElm.html(optHtml);
  //             dynamicCss = { parentDiv: 94, childDiv: 98, childDivMt: 6 };
  //           }

  //           let xaxis = {
  //             'start': data.data.startDate,
  //             'end': data.data.endtDate
  //           }

  //           container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div> <div id="${className}" style="position:absolute; width:100%; height:${dynamicCss.childDiv}%;"></div> </div></div>`);
  //           let lineChart = this.lineChartInit(null, null, className, lineChartData, xaxis);

  //           container.setState({
  //             text: state.text,
  //             //chartData: lineChartData,
  //             containerChartObj: chartObj,
  //             xaxis: xaxis,
  //             //filters: (lineChartFilterData != null) ? "filterString" : null,
  //             selectedFilter: ""
  //           });


  //           if (lineChartFilterData != null) {
  //             $("." + filterDivCl).html(selectElm);
  //           }

  //           $(document).on('change', '.' + className, function () {
  //             let val = $(this).val();
  //             let chartName = $(".line" + className).val();
  //             let dataForChart = comp.chartNames.find(x => x.chartName == chartName);
  //             dataForChart.ChartParameterValue = val;
  //             comp.getLineChartData(dataForChart, className, container, state, chartObj);
  //           });


  //           //trigger change event
  //           if (lineChartFilterData != null && lineChartData.length == 0) {
  //             $('.' + className).trigger('change');
  //           }

  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )


  //   container.on('resize', function () {
  //     setTimeout(() => {
  //       window.dispatchEvent(new Event('resize'));
  //     }, 400);

  //   });

  // }

  // getLineChartData(dataForChart: any, className: any, container: any, state: any, chartObj: any) {
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(dataForChart).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let lineChartData = data.data.lineChartModel;
  //           //let lineChartFilterData = data.data.chartFilterModel;
  //           let xaxis = {
  //             'start': data.data.startDate,
  //             'end': data.data.endtDate
  //           }
  //           container.setState({
  //             text: state.text,
  //             //chartData: lineChartData,
  //             containerChartObj: chartObj,
  //             xaxis: xaxis,
  //             //filters: (lineChartFilterData != null) ? 'filterString' : null,
  //             selectedFilter: dataForChart.ChartParameterValue
  //           });

  //           this.lineChartInit(null, null, className, lineChartData, xaxis);
  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )
  // }

  // lineChartInit(titleText: any, yAxisTitle: any, className: any, chartData: any, xaxis: any) {
  //   Highcharts.chart(
  //     this.lineChartConfigration(
  //       titleText,
  //       yAxisTitle,
  //       className,
  //       chartData,
  //       xaxis
  //     )
  //   );
  // }

  // lineChartConfigration(titleText: any, yAxisTitle: any, selector: any, data: any, xaxis: any) {
  //   let cat = this.diff(xaxis.start, xaxis.end)
  //   return {
  //     title: {
  //       text: titleText
  //     },
  //     xAxis: {
  //       categories: cat,
  //       scrollbar: {
  //         enabled: true
  //       },
  //     },
  //     yAxis: {
  //       title: {
  //         text: yAxisTitle
  //       }
  //     },
  //     plotOptions: {
  //       series: {
  //         label: {
  //           connectorAllowed: true
  //         },
  //       }
  //     },
  //     series: data,
  //     responsive: {
  //       rules: [{
  //         condition: {
  //           maxWidth: '300'
  //         },
  //         chartOptions: {
  //           legend: {
  //             layout: 'horizontal',
  //             align: 'center',
  //             verticalAlign: 'bottom'
  //           }
  //         }
  //       }]
  //     },
  //     chart: {
  //       renderTo: selector,
  //     }
  //   }

  // }

  // renderPieChartIfStatesaved(container: any, state: any, classRefer: any, cl: any = null) {
  //   cl = cl.split(" ")[0] + Math.random();
  //   let className = `pie${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   className = classRefer.helper.replaceAll(className, ".", "");
  //   let filterDivCl = "filterpi" + className;
  //   let chartObj = state.containerChartObj;
  //   chartObj.ChartParameterValue = (state.selectedFilter != null && state.selectedFilter != "") ? state.selectedFilter : classRefer.defaultFilterVal;
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(chartObj).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let pieChartData = data.data.pieChartModel;
  //           let tempArr = [];
  //           pieChartData.map((x) => {
  //             // if (x.name == "Service Overdue") {
  //             //   x.color = "#FF0000";
  //             // }
  //             if (x.y != 0 && x.y != "" && x.y != null) {
  //               tempArr = pieChartData;//data.data.pieChartModel;
  //             }
  //           })
  //           let pieChartFilterData = data.data.chartFilterModel;
  //           let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px;" class="${className}">`);
  //           let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };
  //           if (pieChartFilterData != null) {
  //             let optHtml = "";
  //             for (var val in pieChartFilterData[0]['filterString']) {
  //               let v = pieChartFilterData[0]['filterString'][val]
  //               let selectOpt = (state.selectedFilter == v) ? "selected" : "";
  //               optHtml += (`<option ${selectOpt} value="${v}">${v}</option>`);
  //             }
  //             selectElm.html(optHtml);
  //             dynamicCss = { parentDiv: 95, childDiv: 100, childDivMt: 6 };
  //           }
  //           container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div><div id="${className}" style="width:100%; height: ${dynamicCss.childDiv}%; position:absolute;  margin-top:${dynamicCss.childDivMt}px;"></div> </div></div>`);
  //           this.pieChartInit(null, null, true, className, tempArr, chartObj);

  //           container.setState({
  //             text: state.text,
  //             containerChartObj: chartObj,
  //             selectedFilter: chartObj.ChartParameterValue
  //           });

  //           if (pieChartFilterData != null) {
  //             $("." + filterDivCl).html(selectElm);
  //           }

  //           $(document).on('change', '.' + className, function () {
  //             let val = $(this).val();
  //             let chartName = $(".line" + className).val();
  //             let dataForChart = classRefer.chartNames.find(x => x.chartName == chartName);
  //             dataForChart.ChartParameterValue = val;
  //             classRefer.getPieChartData(dataForChart, className, container, state, chartObj);
  //           })
  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )

  //   container.on('resize', function () {
  //     setTimeout(() => {
  //       window.dispatchEvent(new Event('resize'));
  //     }, 400);
  //   })

  // }


  // pieChart(container: any, state: any, chartObj: any = null, cl = null) {
  //   let comp = this;
  //   cl = cl.split(" ")[0] + Math.random();
  //   let className = `pie${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   className = this.helper.replaceAll(className, ".", "");
  //   let filterDivCl = "filterpi" + className;
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(chartObj).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let pieChartData = data.data.pieChartModel;
  //           // console.log(pieChartData);
  //           let tempArr = [];
  //           pieChartData.map((x) => {
  //             // if (x.name == "Service Overdue") {
  //             //   x.color = "#FF0000";
  //             // }
  //             if (x.y != 0 && x.y != "" && x.y != null) {
  //               tempArr = pieChartData;//data.data.pieChartModel;
  //             }
  //           })
  //           let pieChartFilterData = data.data.chartFilterModel;
  //           let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px;" class="${className}">`);
  //           let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };
  //           if (pieChartFilterData != null) {
  //             let optHtml = "";
  //             for (var val in pieChartFilterData[0]['filterString']) {
  //               let v = pieChartFilterData[0]['filterString'][val]
  //               optHtml += (`<option value="${v}">${v}</option>`);
  //             }
  //             selectElm.html(optHtml);
  //             dynamicCss = { parentDiv: 95, childDiv: 100, childDivMt: 6 };
  //           }
  //           container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div><div id="${className}" style="width:100%; height: ${dynamicCss.childDiv}%; position:absolute;  margin-top:${dynamicCss.childDivMt}px;"></div> </div></div>`);
  //           // console.log(tempArr);
  //           this.pieChartInit(null, null, true, className, tempArr, chartObj);

  //           container.setState({
  //             text: state.text,
  //             //chartData: tempArr,
  //             containerChartObj: chartObj,
  //             //filters: (pieChartFilterData != null) ? 'filterString' : null,
  //             selectedFilter: ""
  //           });

  //           if (pieChartFilterData != null) {
  //             $("." + filterDivCl).html(selectElm);
  //           }

  //           $(document).on('change', '.' + className, function () {
  //             let val = $(this).val();
  //             let chartName = $(".line" + className).val();
  //             let dataForChart = comp.chartNames.find(x => x.chartName == chartName);
  //             dataForChart.ChartParameterValue = val;
  //             comp.getPieChartData(dataForChart, className, container, state, chartObj);
  //           })

  //           //trigger change event
  //           if (pieChartFilterData != null && tempArr.length == 0) {
  //             $('.' + className).trigger('change');
  //           }


  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )


  //   container.on('resize', function () {
  //     setTimeout(() => {
  //       window.dispatchEvent(new Event('resize'));
  //     }, 400);
  //   })

  // }


  // getPieChartData(dataForChart: any, className: any, container: any, state: any, chartObj: any) {
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(dataForChart).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let pieChartData = data.data.pieChartModel;
  //           //let pieChartFilterData = data.data.chartFilterModel;
  //           let tempArr = [];
  //           pieChartData.map((x) => {
  //             // if (x.name == "Service Overdue") {
  //             //   x.color = "#FF0000";
  //             // }
  //             if (x.y != 0 && x.y != "" && x.y != null) {
  //               tempArr = pieChartData//data.data.pieChartModel;
  //             }
  //           })
  //           container.setState({
  //             text: state.text,
  //             //chartData: tempArr,
  //             containerChartObj: chartObj,
  //             //filters: (pieChartFilterData != null) ? 'filterString' : null,
  //             selectedFilter: dataForChart.ChartParameterValue
  //           });

  //           this.pieChartInit(null, null, true, className, tempArr, chartObj);
  //         } else {
  //           this.alertService.error(data.message);
  //         }

  //       }
  //     )
  //   )
  // }

  // pieChartInit(titleText: any = null, yAxisTitle: string = null, allowPointSelect: boolean = true, selector: any, data: any, chartObj = null) {
  //   if (data.length > 0) {
  //     Highcharts.chart(
  //       this.pieChartConfiguration(
  //         titleText,
  //         yAxisTitle,
  //         allowPointSelect,
  //         selector,
  //         data,
  //         chartObj
  //       )
  //     );
  //   } else {
  //     $("#" + selector).css("background-color", "white").html('<div style="text-align: center;margin-top: 16%;font-size: 20px;font-weight: 600;">No Record.</div>');
  //   }

  // }


  // pieChartConfiguration(titleText: any, seriesName: string, allowPointSelect: boolean = true, selector: any, data: any, chartObj = null) {
  //   let comp = this
  //   return {
  //     title: {
  //       text: titleText
  //     },
  //     tooltip: {
  //       pointFormat: 'percentage: <b>{point.percentage:.1f}%</b><br> value: <b>{point.y}</b>'
  //     },
  //     plotOptions: {
  //       pie: {
  //         allowPointSelect: allowPointSelect,
  //         cursor: 'pointer',
  //         dataLabels: {
  //           enabled: true,
  //           format: '<b>{point.name}</b>: {point.percentage:.1f} %'
  //         }
  //       }
  //     },
  //     series: [{
  //       name: seriesName,
  //       colorByPoint: true,
  //       data: data,
  //       point: {
  //         events: {
  //           click: function (event) {
  //             comp.openDrillDownchart(this, chartObj)
  //             // console.log(this.x + " " + this.y);
  //           }
  //         }
  //       }
  //     }],
  //     chart: {
  //       plotShadow: false,
  //       type: 'pie',
  //       renderTo: selector,
  //     },
  //   }

  // }



  // renderBarChartIfStatesaved(container: any, state: any, classRefer: any, cl: any = null) {
  //   cl = cl.split(" ")[0] + Math.random();
  //   let className = `bar${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   className = this.helper.replaceAll(className, ".", "");
  //   let filterDivCl = "filterbar" + className;
  //   let chartObj = state.containerChartObj;
  //   chartObj.ChartParameterValue = (state.selectedFilter != null && state.selectedFilter != "") ? state.selectedFilter : classRefer.defaultFilterVal;

  //   let getChartData;
  //   if (chartObj.ddChartId != undefined) {
  //     getChartData = this.eventMangerDashboardService.drillDownStackedBarChartData(chartObj)
  //   } else {
  //     getChartData = this.hnsPortalService.getChartData(chartObj);
  //   }

  //   this.subs.add(
  //     getChartData.subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let barChartData = data.data;
  //           let barChartFilterData = data.data.chartFilterModel;
  //           let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px;" class="${className}">`);
  //           let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };
  //           if (barChartFilterData != null) {
  //             let optHtml = "";
  //             for (var val in barChartFilterData[0]['filterString']) {
  //               let v = barChartFilterData[0]['filterString'][val]
  //               let selectOpt = (state.selectedFilter == v) ? "selected" : "";
  //               optHtml += (`<option ${selectOpt} value="${v}">${v}</option>`);
  //             }
  //             selectElm.html(optHtml);
  //             dynamicCss = { parentDiv: 95, childDiv: 100, childDivMt: 6 };
  //           }
  //           container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div><div id="${className}" style="width:100%; height: ${dynamicCss.childDiv}%; position:absolute;  margin-top:${dynamicCss.childDivMt}px;"></div> </div></div>`);

  //           this.barChartInit(null, null, true, className, barChartData, chartObj);

  //           container.setState({
  //             text: state.text,
  //             //chartData: barChartData,
  //             containerChartObj: chartObj,
  //             //filters: (barChartFilterData != null) ? 'filterString' : null,
  //             selectedFilter: chartObj.ChartParameterValue
  //           });

  //           if (barChartFilterData != null) {
  //             $("." + filterDivCl).html(selectElm);
  //           }

  //           $(document).on('change', '.' + className, function () {
  //             let val = $(this).val();
  //             let chartName = $(".line" + className).val();
  //             let dataForChart = classRefer.chartNames.find(x => x.chartName == chartName);
  //             dataForChart.ChartParameterValue = val;
  //             classRefer.getBarChartData(dataForChart, className, container, state, chartObj);
  //           })
  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )


  //   container.on('resize', function () {
  //     setTimeout(() => {
  //       window.dispatchEvent(new Event('resize'));
  //     }, 400);
  //   })

  // }



  // barChart(container: any, state: any, chartObj: any = null, cl = null) {
  //   let comp = this;
  //   cl = cl.split(" ")[0] + Math.random();
  //   let className = `bar${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   className = this.helper.replaceAll(className, ".", "");
  //   let filterDivCl = "filterbar" + className;

  //   let getChartData;
  //   if (chartObj.ddChartId != undefined) {
  //     getChartData = this.eventMangerDashboardService.drillDownStackedBarChartData(chartObj)
  //   } else {
  //     getChartData = this.hnsPortalService.getChartData(chartObj);
  //   }

  //   this.subs.add(
  //     getChartData.subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let barChartData = data.data;
  //           let barChartFilterData = data.data.chartFilterModel;
  //           let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px;" class="${className}">`);
  //           let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };
  //           if (barChartFilterData != null) {
  //             let optHtml = "";
  //             for (var val in barChartFilterData[0]['filterString']) {
  //               let v = barChartFilterData[0]['filterString'][val]
  //               optHtml += (`<option value="${v}">${v}</option>`);
  //             }
  //             selectElm.html(optHtml);
  //             dynamicCss = { parentDiv: 95, childDiv: 100, childDivMt: 6 };
  //           }
  //           container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="line${className}"><div class="col-md-12"><div class="${filterDivCl}"></div><div id="${className}" style="width:100%; height: ${dynamicCss.childDiv}%; position:absolute;  margin-top:${dynamicCss.childDivMt}px;"></div> </div></div>`);

  //           this.barChartInit(null, null, true, className, barChartData, chartObj);

  //           container.setState({
  //             text: state.text,
  //             //chartData: barChartData,
  //             containerChartObj: chartObj,
  //             //filters: (barChartFilterData != null) ? 'filterString' : null,
  //             selectedFilter: ""
  //           });

  //           if (barChartFilterData != null) {
  //             $("." + filterDivCl).html(selectElm);
  //           }

  //           $(document).on('change', '.' + className, function () {
  //             let val = $(this).val();
  //             let chartName = $(".line" + className).val();
  //             let dataForChart = comp.chartNames.find(x => x.chartName == chartName);
  //             dataForChart.ChartParameterValue = val;
  //             comp.getBarChartData(dataForChart, className, container, state, chartObj);
  //           })


  //           //trigger change event
  //           if (barChartFilterData != null && barChartData.stackedBarChartViewModelList.length == 0) {
  //             $('.' + className).trigger('change');
  //           }


  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )

  //   container.on('resize', function () {
  //     setTimeout(() => {
  //       window.dispatchEvent(new Event('resize'));
  //     }, 400);
  //   })

  // }


  // getBarChartData(dataForChart: any, className: any, container: any, state: any, chartObj: any) {
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(dataForChart).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let barChartData = data.data;
  //           //let barChartFilterData = data.data.chartFilterModel;
  //           container.setState({
  //             text: state.text,
  //             //chartData: barChartData,
  //             containerChartObj: chartObj,
  //             //filters: (barChartFilterData != null) ? 'filterString' : null,
  //             selectedFilter: dataForChart.ChartParameterValue
  //           });
  //           this.barChartInit(null, null, true, className, barChartData, dataForChart);
  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )
  // }

  // barChartInit(titleText: any = null, yAxisTitle: string = null, allowPointSelect: boolean = true, selector: any, data: any, barChartParams: any = null) {
  //   if (data.categories != null) {
  //     Highcharts.chart(
  //       this.barChartConfiguration(
  //         titleText,
  //         yAxisTitle,
  //         allowPointSelect,
  //         selector,
  //         data,
  //         barChartParams
  //       )
  //     );
  //   } else {
  //     $("#" + selector).css("background-color", "white").html('<div style="text-align: center;margin-top: 16%;font-size: 20px;font-weight: 600;">No Record.</div>');

  //   }

  // }


  // barChartConfiguration(titleText: any, seriesName: string, allowPointSelect: boolean = true, selector: any, data: any, barChartParams: any = null) {

  //   let color = barChartParams != null ? barChartParams.color : '';
  //   //let chartParams =  Object.assign([], barChartParams); 
  //   if (barChartParams.ddChartID != undefined) {
  //     barChartParams.seriesId = data.stackedBarChartViewModelList[0].seriesId
  //   }

  //   // console.log(data);

  //   let comp = this;
  //   return {
  //     chart: {
  //       type: 'column',
  //       renderTo: selector,
  //     },
  //     title: {
  //       text: titleText
  //     },
  //     xAxis: {
  //       categories: data.categories,
  //       min: 0,
  //       max: data.categories.length - 1,
  //       labels: {
  //         rotation: 90,
  //       }
  //     },
  //     yAxis: {
  //       min: 0,
  //       title: {
  //         text: ''
  //       }
  //     },
  //     tooltip: {
  //       pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
  //       shared: true
  //     },
  //     legend: { enabled: false },
  //     plotOptions: {
  //       column: {
  //         stacking: 'normal',
  //         'zones': [{
  //           color: color,
  //         }]
  //       },
  //       series: {
  //         cursor: 'pointer',
  //         point: {
  //           events: {
  //             click: function (event) {
  //               comp.openGridOnClickOfBarChart(this, barChartParams)
  //             }
  //           }
  //         },

  //       }
  //     },
  //     series: data.stackedBarChartViewModelList,

  //   }

  // }


  // // group chart

  // renderGroupBarChartIfStatesaved(container: any, state: any, classRefer: any, cl: any = null) {
  //   cl = cl.split(" ")[0] + Math.random();
  //   let className = `bar${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   className = this.helper.replaceAll(className, ".", "");
  //   className = this.helper.replaceAll(className, "/", "");
  //   let filterDivCl = "filterbar" + className;
  //   let chartObj = state.containerChartObj;
  //   chartObj.ChartParameterValue = (state.selectedFilter != null && state.selectedFilter != "") ? state.selectedFilter : classRefer.defaultFilterVal;
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(chartObj).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let chartData = data.data;
  //           let chartFilterData = data.data.chartFilterModel;
  //           let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px;" class="${className}">`);
  //           let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };
  //           if (chartFilterData != null) {
  //             let optHtml = "";
  //             for (var val in chartFilterData[0]['filterString']) {
  //               let v = chartFilterData[0]['filterString'][val]
  //               let selectOpt = (state.selectedFilter == v) ? "selected" : "";
  //               optHtml += (`<option ${selectOpt} value="${v}">${v}</option>`);
  //             }
  //             selectElm.html(optHtml);
  //             dynamicCss = { parentDiv: 95, childDiv: 100, childDivMt: 6 };
  //           }
  //           container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="grpBar${className}"><div class="col-md-12"><div class="${filterDivCl}"></div><div id="${className}" style="width:100%; height: ${dynamicCss.childDiv}%; position:absolute;  margin-top:${dynamicCss.childDivMt}px;"></div> </div></div>`);

  //           this.groupBarChartInit(null, null, true, className, chartData);

  //           container.setState({
  //             text: state.text,
  //             //chartData: barChartData,
  //             containerChartObj: chartObj,
  //             //filters: (barChartFilterData != null) ? 'filterString' : null,
  //             selectedFilter: chartObj.ChartParameterValue
  //           });

  //           if (chartFilterData != null) {
  //             $("." + filterDivCl).html(selectElm);
  //           }

  //           $(document).on('change', '.' + className, function () {
  //             let val = $(this).val();
  //             let chartName = $(".grpBar" + className).val();
  //             let dataForChart = classRefer.chartNames.find(x => x.chartName == chartName);
  //             dataForChart.ChartParameterValue = val;
  //             classRefer.getGroupBarChartData(dataForChart, className, container, state, chartObj);
  //           })
  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )


  //   container.on('resize', function () {
  //     setTimeout(() => {
  //       window.dispatchEvent(new Event('resize'));
  //     }, 400);
  //   })

  // }



  // groupBarChart(container: any, state: any, chartObj: any = null, cl = null) {
  //   let comp = this;
  //   cl = cl.split(" ")[0] + Math.random();
  //   let className = `grpbar${new Date().getMilliseconds()}${Math.random()}${cl}`;
  //   className = this.helper.replaceAll(className, ".", "");
  //   className = this.helper.replaceAll(className, "/", "");
  //   let filterDivCl = "filtergrpbar" + className;
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(chartObj).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           //console.log(data);
  //           let chartData = data.data;
  //           let chartFilterData = data.data.chartFilterModel;
  //           let selectElm = $(`<select style="margin-right: -24px;background-color: #fff;background-clip: padding-box;border: 1px solid #ced4da; margin-top: 3px; margin-left: 2px;" class="${className}">`);
  //           let dynamicCss = { parentDiv: 100, childDiv: 100, childDivMt: 0 };
  //           if (chartFilterData != null) {
  //             let optHtml = "";
  //             for (var val in chartFilterData[0]['filterString']) {
  //               let v = chartFilterData[0]['filterString'][val]
  //               optHtml += (`<option value="${v}">${v}</option>`);
  //             }
  //             selectElm.html(optHtml);
  //             dynamicCss = { parentDiv: 95, childDiv: 100, childDivMt: 6 };
  //           }
  //           container.getElement().html(`<div class="row" style="width:100%; height:${dynamicCss.parentDiv}%;"><input type="hidden" value="${chartObj.chartName}" class="grpBar${className}"><div class="col-md-12"><div class="${filterDivCl}"></div><div id="${className}" style="width:100%; height: ${dynamicCss.childDiv}%; position:absolute;  margin-top:${dynamicCss.childDivMt}px;"></div> </div></div>`);

  //           this.groupBarChartInit(null, null, true, className, chartData);

  //           container.setState({
  //             text: state.text,
  //             //chartData: barChartData,
  //             containerChartObj: chartObj,
  //             //filters: (barChartFilterData != null) ? 'filterString' : null,
  //             selectedFilter: ""
  //           });

  //           if (chartFilterData != null) {
  //             $("." + filterDivCl).html(selectElm);
  //           }

  //           $(document).on('change', '.' + className, function () {
  //             let val = $(this).val();
  //             let chartName = $(".grpBar" + className).val();
  //             let dataForChart = comp.chartNames.find(x => x.chartName == chartName);
  //             dataForChart.ChartParameterValue = val;
  //             comp.getGroupBarChartData(dataForChart, className, container, state, chartObj);
  //           })

  //           //trigger change event
  //           if (chartFilterData != null && chartData.length == 0) {
  //             $('.' + className).trigger('change');
  //           }



  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )

  //   container.on('resize', function () {
  //     setTimeout(() => {
  //       window.dispatchEvent(new Event('resize'));
  //     }, 400);
  //   })

  // }


  // getGroupBarChartData(dataForChart: any, className: any, container: any, state: any, chartObj: any) {
  //   this.subs.add(
  //     this.hnsPortalService.getChartData(dataForChart).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           let chartData = data.data;
  //           //let barChartFilterData = data.data.chartFilterModel;
  //           container.setState({
  //             text: state.text,
  //             //chartData: barChartData,
  //             containerChartObj: chartObj,
  //             //filters: (barChartFilterData != null) ? 'filterString' : null,
  //             selectedFilter: dataForChart.ChartParameterValue
  //           });
  //           this.groupBarChartInit(null, null, true, className, chartData);
  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )
  // }

  // groupBarChartInit(titleText: any = null, yAxisTitle: string = null, allowPointSelect: boolean = true, selector: any, data: any) {
  //   if (data.categories != null) {
  //     Highcharts.chart(
  //       this.groupBarChartConfiguration(
  //         titleText,
  //         yAxisTitle,
  //         allowPointSelect,
  //         selector,
  //         data
  //       )
  //     );
  //   } else {
  //     $("#" + selector).css("background-color", "white").html('<div style="text-align: center;margin-top: 16%;font-size: 20px;font-weight: 600;">No Record.</div>');
  //   }

  // }


  // groupBarChartConfiguration(titleText: any, seriesName: string, allowPointSelect: boolean = true, selector: any, data: any) {

  //   return {
  //     chart: {
  //       type: 'column',
  //       renderTo: selector,
  //     },
  //     title: {
  //       text: titleText
  //     },
  //     xAxis: {
  //       categories: data.categories,
  //       crosshair: true,
  //       min: 0,
  //       max: data.categories.length - 1,
  //       labels: {
  //         rotation: 90,
  //       }
  //     },
  //     yAxis: {
  //       min: 0,
  //       title: {
  //         text: ''
  //       }
  //     },
  //     tooltip: {
  //       headerFormat: '<span style="font-size:12px">{point.key}</span><table>',
  //       pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
  //         '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
  //       footerFormat: '</table>',
  //       shared: true,
  //       useHTML: true
  //     },
  //     plotOptions: {
  //       column: {
  //         pointPadding: 0.3,
  //         borderWidth: 0
  //       }
  //     },
  //     series: data.stackedBarChartViewModelList
  //   }

  // }



  // getChartName() {
  //   this.subs.add(
  //     this.hnsPortalService.getChartType().subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           this.chartNames = data.data;
  //         } else {
  //           this.alertService.error(data.message);
  //         }
  //       }
  //     )
  //   )
  // }


  // saveChartsState() {
  //   if ($('.lm_vertical').length == 0 && $('.lm_horizontal').length == 0 && $('.lm_selectable').length == 0) {
  //     this.alertService.error("There is no state to save.");
  //     return
  //   }
  //   const state = JSON.stringify(this.myLayout.toConfig());
  //   const chartState = { UserId: this.currentUser.userId, ChartData: state, dashboard: this.portalName }
  //   this.subs.add(
  //     this.hnsPortalService.saveUserChartData(chartState).subscribe(
  //       data => {
  //         if (data.isSuccess) {
  //           this.dashboardName = this.portalName;
  //           this.alertService.success("Chart state saved successfully.")
  //         } else {
  //           this.alertService.error("Something went wrong.")
  //         }
  //       }
  //     )
  //   )
  // }


  // openChartList() {
  //   var scrollTop = $('.layout-container').height();
  //   $('.search-container').show();
  //   $('.search-container').css('height', scrollTop);
  //   if ($('.search-container').hasClass('dismiss')) {
  //     $('.search-container').removeClass('dismiss').addClass('selectedcs').show();
  //   }
  // }

  // closeSearchBar() {
  //   if ($('.search-container').hasClass('selectedcs')) {
  //     $('.search-container').removeClass('selectedcs').addClass('dismiss');
  //     $('.search-container').animate({ width: 'toggle' });
  //   }
  // }

  // diff(from, to) {
  //   let arr = [];
  //   let datFrom = new Date('1 ' + from);
  //   let datTo = new Date('1 ' + to);
  //   let fromYear = datFrom.getFullYear();
  //   let toYear = datTo.getFullYear();
  //   let diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();

  //   for (let i = datFrom.getMonth(); i <= diffYear; i++) {
  //     arr.push(this.monthNames[i % 12] + " " + Math.floor(fromYear + (i / 12)));
  //   }

  //   return arr;
  // }




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
  //           this.openGridOnClickOfBarChart(chartEvent, parentChartObj, true);
  //       }
  //     }
  //   }
  // }

  // openGridOnClickOfBarChart(chartEvent, parentChartObj, fromPieChart:boolean = false) {
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
  //         this.selectedBarChartXasis = {
  //         "ddChartId": parentChartObj.ddChartId != undefined ? parentChartObj.ddChartId : parentChartObj.ddChartID,
  //         "parantChartId": parentChartObj.parantChartId != undefined ? parentChartObj.parantChartId : parentChartObj.chartID,
  //         "xAxisValue": chartEvent.category,
  //         "seriesId": parentChartObj.seriesId,
  //         "chartName": parentChartObj.chartName
  //       }
  //     }
  //       this.openGrid();
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
