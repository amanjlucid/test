import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';


@Injectable()
export class EventManagerDashboardService {
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };


    constructor(private http: HttpClient) { }

    getListOfUserEventByCriteria(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/DrillDownChartGridData`, body, this.httpOptions);

    }

    drillDownStackedBarChartData(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/DrillDownStackedBarChartData`, body, this.httpOptions);

    }



}
