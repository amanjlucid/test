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

    // getChartType() {
    //     return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyChart/GetHealtSafetyChartList`, this.httpOptions);
    // }

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

    getChartsList(chartArea: string) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetChartsList?chartArea=${encodeURIComponent(chartArea)}`, this.httpOptions);
    }



    //########## CHART CONFIGURATION ##################//

    pieChartInit(selector: any, data: any, chartObj = null, titleText: any = null, yAxisTitle: string = null, allowPointSelect: boolean = true) {
        if (data.length > 0) {
            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                }
            });
            Highcharts.chart(
                this.pieChartConfiguration(
                    selector,
                    data,
                    chartObj,
                    titleText,
                    yAxisTitle,
                    allowPointSelect
                )
            );
        } else {
            $("#" + selector).css("background-color", "white").html('<div style="text-align: center;margin-top: 16%;font-size: 20px;font-weight: 600;">No Record.</div>');
        }

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
        if (chartData.length) {
            Highcharts.chart(
                this.lineChartConfigration(
                    className,
                    chartData,
                    xaxis,
                    titleText,
                    yAxisTitle,
                )
            );
        } else {
            $("#" + className).css("background-color", "white").html('<div style="text-align: center;margin-top: 10%;font-size: 20px;font-weight: 600;">No Record.</div>');
        }

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
        if (data.categories != null) {
            Highcharts.chart(
                this.barChartConfiguration(
                    selector,
                    data,
                    barChartParams,
                    titleText,
                    yAxisTitle,
                    allowPointSelect,

                ), function (chart) { // on complete
                    chart.renderer.text('No Data Available', 140, 120)
                        .css({
                            color: '#4572A7',
                            fontSize: '16px'
                        })
                        .add();

                }
            );
        }

        else {
            $("#" + selector).css("background-color", "white").html('<div style="text-align: center;margin-top: 16%;font-size: 20px;font-weight: 600;">No Record.</div>');
        }

    }


    barChartConfiguration(selector: any, data: any, barChartParams: any = null, titleText: any, seriesName: string, allowPointSelect: boolean = true) {
        const service = this
        const { categories, stackedBarChartViewModelList } = data;
        //IF CATEGORY 
        if (!categories) {
            return {
                chart: {
                    type: 'column',
                    renderTo: selector,
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },

                series: []
            }
        }

        let max = 10;
        let scroll = true;
        if (categories && categories.length < 10) {
            scroll = false;
            max = categories.length - 1;
        }
        let color = barChartParams != null ? barChartParams.color : '';
        if (barChartParams.ddChartID != undefined) {
            barChartParams.seriesId = data.stackedBarChartViewModelList[0].seriesId
        }

        return {
            chart: {
                type: 'column',
                renderTo: selector,
                events: {
                    load: function () {
                        const axis = this.xAxis[0]
                        const ticks = axis.ticks
                        const points = this.series[0].points
                        //const tooltip = this.tooltip
                        points.forEach(function (point, i) {
                            if (ticks[i]) {
                                const label = ticks[i].label.element
                                label.onclick = function () {
                                    service.changeChartInfo({ chartRef: point, chartObject: barChartParams, chartType: 'bar' })
                                    // console.log(point);
                                    // tooltip.getPosition(null, null, point) 
                                    // tooltip.refresh(point)
                                }
                            }

                        })
                    }
                }
            },
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
            legend: { enabled: false },
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
        }

    }



    groupBarChartInit(selector: any, data: any, titleText: any = null, yAxisTitle: string = null, allowPointSelect: boolean = true) {
        if (data.categories != null) {
            Highcharts.chart(
                this.groupBarChartConfiguration(
                    selector,
                    data,
                    titleText,
                    yAxisTitle,
                    allowPointSelect,
                )
            );
        } else {
            $("#" + selector).css("background-color", "white").html('<div style="text-align: center;margin-top: 16%;font-size: 20px;font-weight: 600;">No Record.</div>');
        }

    }


    groupBarChartConfiguration(selector: any, data: any, titleText: any, seriesName: string, allowPointSelect: boolean = true) {
        const { categories, stackedBarChartViewModelList } = data;
        const scroll = categories.length < 13 ? false : true;
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
                // max: data.categories.length - 1,
                max: 10,
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