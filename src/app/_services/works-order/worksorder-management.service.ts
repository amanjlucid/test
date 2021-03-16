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

    getManagementData(activeInactive = "A") {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Programmes/GetProgrammesGridData?activeInactive=${activeInactive}`, this.httpOptions);
    }

    addWorkOrderManagement(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Programmes/InsertWorksProgramme`, body, this.httpOptions)
    }

    updateWorksProgramme(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Programmes/UpdateWorksProgramme`, body, this.httpOptions)
    }

    deleteWorkOrderManagement(params) {
        const { WPRSEQUENCE, userId, CheckOrProcess } = params;
        // let body = JSON.stringify(params);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Programmes/DeleteWorkProgramme?WPRSEQUENCE=${WPRSEQUENCE}&userId=${userId}&CheckOrProcess=${CheckOrProcess}`, this.httpOptions);
    }

    getWorkProgrammesByWprsequence(WPRSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Programmes/GetWorkProgrammesByWprsequence?WPRSequence=${WPRSequence}`, this.httpOptions);
    }

    // updateSchedulingReport(params) {
    //     let body = JSON.stringify(params);
    //     return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/UpdateSchedulingReport`, body, this.httpOptions);
    // }

    // getSchedulingList(reportId) {
    //     return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetSchedulingList?reportId=${reportId}`, this.httpOptions);
    // }


}