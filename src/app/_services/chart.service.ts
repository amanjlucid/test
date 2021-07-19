import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    getChartType() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyChart/GetHealtSafetyChartList`, this.httpOptions);
    }

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
        let comp = this
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
                // point: {
                //     events: {
                //         click: function (event) {
                //             // comp.openDrillDownchart(this, chartObj)
                //         }
                //     }
                // }
            }],
            chart: {
                plotShadow: false,
                type: 'pie',
                renderTo: selector,
            },
        }

    }


    lineChartInit(className: any, chartData: any, xaxis: any, titleText: any, yAxisTitle: any) {
        Highcharts.chart(
            this.lineChartConfigration(
                className,
                chartData,
                xaxis,
                titleText,
                yAxisTitle,
            )
        );
    }

    lineChartConfigration(selector: any, data: any, xaxis: any, titleText: any, yAxisTitle: any) {
        let category = this.diff(xaxis.start, xaxis.end);
        console.log(category)
        let maxCol = category?.length < 10 ? category.length : 10;
        let scroll = maxCol < 10 ? false : true;
        console.log(scroll)
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
}