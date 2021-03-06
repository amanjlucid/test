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

    getEventManagerChartsList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Manager/GetEventManagerChartsList`, this.httpOptions);
        
    }

    drillDownStackedBarChartData(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/DrillDownStackedBarChartData`, body, this.httpOptions);
        
    }
    
    //api/Manager/GetEventManagerChartsList

}