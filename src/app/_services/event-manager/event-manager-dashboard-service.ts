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

    // getChartType() {
    //     let httpOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/json'
    //         }),
    //     };
    //     return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyChart/GetHealtSafetyChartList`, httpOptions);
    // }

    getListOfUserEventByCriteria(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/GetListOfUserEventByCriteria`, body, this.httpOptions);
        
    }

    getEventManagerChartsList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Manager/GetEventManagerChartsList`, this.httpOptions);
        
    }
    
    //api/Manager/GetEventManagerChartsList

}