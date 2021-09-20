import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { appConfig } from '../app.config';
declare var Highcharts: any;

@Injectable()
export class ChartService {
    monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };


    constructor(private http: HttpClient) { }

      getChartData(chartDetail) {
        let body = JSON.stringify(chartDetail);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Chart/GetChartData`, body, this.httpOptions);
    }

    getUserChartData(userId: string, dashboard: string) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetUserChartData?userId=${userId}&dashboard=${dashboard}`, this.httpOptions);
    }

    saveUserChartData(params: any) {
        const { UserId, ChartData, dashboard } = params;
        let body = JSON.stringify({ chartData: ChartData });
        return this.http.post<any>(`${appConfig.apiUrl}/api/Chart/SaveUserChartData?userId=${UserId}&dashboard=${dashboard}`, body, this.httpOptions);
    }


    drillDownStackedBarChartData(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/DrillDownStackedBarChartData`, body, this.httpOptions);
    }

    getChartsList(chartArea: string, userID: string) {
      //return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetChartsList?chartArea=${encodeURIComponent(chartArea)}`, this.httpOptions);
      return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetChartsList?chartArea=${encodeURIComponent(chartArea)}&userID=${encodeURIComponent(userID)}`, this.httpOptions);
    }

    getListOfUserEventByCriteria(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/DrillDownChartGridData`, body, this.httpOptions);
    }


    checkDrillDownChartGridDataIsNull(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/CheckDrillDownChartGridDataIsNull`, body, this.httpOptions);
    }

    getUserChartSetting() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetUserChartSetting`, this.httpOptions);
    }

    SaveUserChartSettings(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Chart/SaveUserChartSettings`, body, this.httpOptions);
    }

    DeleteChartState(dashBoard) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/DeleteChartState?dashBoard=${dashBoard}`, this.httpOptions);
    }

    getChartById(chartId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetChartById?chartId=${chartId}`, this.httpOptions);
    }

    getUserChartByDashboard(Dashboard) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetUserChartByDashboard?Dashboard=${Dashboard}`, this.httpOptions);
    }
    //########## CHART CONFIGURATION ##################//

    pieChartInit(selector: any, data: any, chartObj = null, titleText: any = null, yAxisTitle: string = null, allowPointSelect: boolean = true) {
        // if (data.length > 0) {
        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });
        let chart = Highcharts.chart(
            this.pieChartConfiguration(
                selector,
                data,
                chartObj,
                titleText,
                yAxisTitle,
                allowPointSelect
            ), function (chart) { // on complete
                if (data.length == 0) {
                    const text = chart.renderer.text('No Data Available')
                        .css({
                            color: '#4572A7',
                            fontSize: '20px',
                            margin: "40px"
                        }).add();
                    let textBBox = text.getBBox();
                    let x = chart.plotLeft + (chart.plotWidth * 0.5) - (textBBox.width * 0.5);
                    let y = chart.plotTop  + (chart.plotHeight * 0.5) + (textBBox.height * 0.25);
                    text.attr({ x: x, y: y });
                }
            }
        );

        return chart
        // }

        // else {
        //     $("#" + selector).css("background-color", "white").html('<div style="text-align: center;margin-top: 16%;font-size: 20px;font-weight: 600;">No Data Available.</div>');
        // }

    }

    pieChartConfiguration(selector: any, data: any, chartObj = null, titleText: any, seriesName: string, allowPointSelect: boolean = true) {
        let service = this
        let format = (chartObj && chartObj.valueFormat) ? chartObj.valueFormat : '';
        let prefix = (chartObj && chartObj.valuePrefix) ? chartObj.valuePrefix : '';
        let suffix = (chartObj && chartObj.valueSuffix) ? chartObj.valueSuffix : '';

        return {
            title: {
                text: titleText
            },
            tooltip: {
                pointFormat: 'percentage: <b>{point.percentage:.1f}%</b><br> value: <b>' + prefix + '{point.y' + format + '}' + suffix + '</b>',
            },
            plotOptions: {
                pie: {
                    allowPointSelect: allowPointSelect,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    }
                }
            },
            series: [{
                name: seriesName,
                colorByPoint: true,
                data: data,
                point: {
                    events: {
                        click: function (event) {
                            service.changeChartInfo({ chartRef: this, chartObject: chartObj, chartType: 'pie' })
                        }
                    }
                }
            }],
            chart: {
                plotShadow: false,
                type: 'pie',
                renderTo: selector,
            },
        }

    }


    lineChartInit(className: any, chartData: any, xaxis: any, titleText: any = null, yAxisTitle: any = null) {
        // if (chartData.length) {
        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });

        let chart = Highcharts.chart(
            this.lineChartConfigration(
                className,
                chartData,
                xaxis,
                titleText,
                yAxisTitle,
            ), function (chart) { // on complete
                if (chartData.length == 0) {
                    chart.renderer.text('No Data Available', 140, 120)
                        .css({
                            color: '#4572A7',
                            fontSize: '20px',
                            margin: "20px"
                        }).add();
                }
            }
        );

        return chart
        // } else {
        //     $("#" + className).css("background-color", "white").html('<div style="text-align: center;margin-top: 10%;font-size: 20px;font-weight: 600;">No Record.</div>');
        // }

    }

    lineChartConfigration(selector: any, data: any, xaxis: any, titleText: any, yAxisTitle: any) {
        let category = this.diff(xaxis.start, xaxis.end);
        let maxCol = category?.length < 10 ? category.length : 10;
        let scroll = maxCol < 10 ? false : true;

        return {
            title: {
                text: titleText
            },
            xAxis: {
                categories: category,
                scrollbar: {
                    enabled: scroll
                },
                min: 0,
                max: maxCol
            },
            yAxis: {
                title: {
                    text: yAxisTitle
                }
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: true
                    },
                }
            },
            series: data,
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: '300'
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            },
            chart: {
                renderTo: selector,
            }
        }

    }


    barChartInit(selector: any, data: any, barChartParams: any = null, titleText: any = null, yAxisTitle: string = null, allowPointSelect: boolean = true) {
        // if (data.categories != null) {
        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });

        let chart = Highcharts.chart(
            this.barChartConfiguration(
                selector,
                data,
                barChartParams,
                titleText,
                yAxisTitle,
                allowPointSelect,

            ), function (chart) { // on complete
                if (data.categories == null) {
                    chart.renderer.text('No Data Available', 140, 120)
                        .css({
                            color: '#4572A7',
                            fontSize: '20px',
                            margin: "20px"
                        }).add();
                }
            }
        );

        return chart;
        // }

        // else {
        //     $("#" + selector).css("background-color", "white").html('<div style="text-align: center;margin-top: 16%;font-size: 20px;font-weight: 600;">No Record.</div>');
        // }

    }


    barChartConfiguration(selector: any, data: any, barChartParams: any = null, titleText: any, seriesName: string, allowPointSelect: boolean = true) {
        const service = this
        const { categories, stackedBarChartViewModelList } = data;
        let max = 10;
        let scroll = true;
        let color = '';

        if (categories != null) {
            if (categories && categories.length < 10) {
                scroll = false;
                max = categories.length - 1;
            }
            color = barChartParams != null ? barChartParams.color : '';
            if (barChartParams.ddChartID != undefined) {
                barChartParams.seriesId = data.stackedBarChartViewModelList[0].seriesId
            }

            if (color) {
                if (stackedBarChartViewModelList[0].color == null) {
                    stackedBarChartViewModelList[0].color = color;
                }
            }
        }


        return {
            title: {
                text: titleText
            },
            xAxis: {
                categories: categories,
                min: 0,
                max: max,
                labels: {
                    style: {
                        cursor: 'pointer'
                    },
                    rotation: 90,
                    formatter: function () {
                        if (this.tick.label) {
                            const label = this.tick.label.element;
                            label.onclick = () => {
                                service.changeChartInfo({ chartRef: { category: this.value }, chartObject: barChartParams, chartType: 'bar' })
                                // const points = this.axis.series[0].points;
                                // const point = points.find((val, ind) => ind == this.pos)
                                // console.log(point)
                                // console.log(this)
                            }
                        }

                        return `<a href="javascript:void(0);">${this.value}</a>`;

                    }
                },
                scrollbar: {
                    enabled: scroll,
                },

            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.2f}</b><br/>',
                shared: true
            },
            legend: { enabled: true },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    'zones': [{
                        color: color,
                    }]
                },
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function (event) {
                                service.changeChartInfo({ chartRef: this, chartObject: barChartParams, chartType: 'bar' })
                            }
                        }
                    },
                }
            },
            series: stackedBarChartViewModelList,
            chart: {
                type: 'column',
                renderTo: selector,
            },
        }

    }



    groupBarChartInit(selector: any, data: any, titleText: any = null, yAxisTitle: string = null, allowPointSelect: boolean = true) {
        // if (data.categories != null) {
        let chart = Highcharts.chart(
            this.groupBarChartConfiguration(
                selector,
                data,
                titleText,
                yAxisTitle,
                allowPointSelect,
            ), function (chart) { // on complete
                if (data.categories == null) {
                    chart.renderer.text('No Data Available', 140, 120)
                        .css({
                            color: '#4572A7',
                            fontSize: '20px',
                            margin: "20px"
                        }).add();
                }
            }
        );

        return chart;
        // } else {
        //     $("#" + selector).css("background-color", "white").html('<div style="text-align: center;margin-top: 16%;font-size: 20px;font-weight: 600;">No Record.</div>');
        // }

    }


    groupBarChartConfiguration(selector: any, data: any, titleText: any, seriesName: string, allowPointSelect: boolean = true) {
        const { categories, stackedBarChartViewModelList } = data;
        let max = 10;
        let scroll = true;
        if (categories && categories.length < 10) {
            scroll = false;
            max = categories.length - 1;
        }
        return {
            chart: {
                type: 'column',
                renderTo: selector,
            },
            title: {
                text: titleText
            },
            xAxis: {
                categories: categories,
                crosshair: true,
                min: 0,
                max: max,
                labels: {
                    rotation: 90,
                },
                scrollbar: {
                    enabled: scroll,
                },
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:12px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.3,
                    borderWidth: 0
                }
            },
            series: stackedBarChartViewModelList
        }

    }


    diff(from, to) {
        let arr = [];
        let datFrom = new Date('1 ' + from);
        let datTo = new Date('1 ' + to);
        let fromYear = datFrom.getFullYear();
        let toYear = datTo.getFullYear();
        let diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();

        for (let i = datFrom.getMonth(); i <= diffYear; i++) {
            arr.push(this.monthNames[i % 12] + " " + Math.floor(fromYear + (i / 12)));
        }

        return arr;
    }


    private chartClickSource = new BehaviorSubject<any>([]);
    chartInfo = this.chartClickSource.asObservable();


    changeChartInfo(data) {
        this.chartClickSource.next(data)
    }


}
