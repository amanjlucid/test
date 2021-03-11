import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WorksorderManagementService {
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };

    constructor(private http: HttpClient) { }

    getManagementData(activeInactive = "A"){
        return this.http.get<any>(`${appConfig.apiUrl}/api/Programmes/GetProgrammesGridData?activeInactive=${activeInactive}`, this.httpOptions);
    }
    
    // updateSchedulingReport(params) {
    //     let body = JSON.stringify(params);
    //     return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/UpdateSchedulingReport`, body, this.httpOptions);
    // }

    // getSchedulingList(reportId) {
    //     return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetSchedulingList?reportId=${reportId}`, this.httpOptions);
    // }


}