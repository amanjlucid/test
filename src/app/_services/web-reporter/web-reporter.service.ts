import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';


@Injectable()
export class WebReporterService {
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };

    constructor(private http: HttpClient) { }
    //643292953
    // getEventTypeList() {
    //     return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/GetListOfEventType`, this.httpOptions);
    // }

    // getSelectedTaskData(params) {
    //     // let body = JSON.stringify(params);
    //     return this.http.post<any>(`${appConfig.apiUrl}/api/EventType/GetSelectedTaskData`, params, this.httpOptions);

    // }

    getCategories() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetCategoryList`, this.httpOptions);
    }

    getUserCategory() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/ListXportUserCategories`, this.httpOptions);
    }

    getColumns() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetXportOutputColumnsSelection`, this.httpOptions);
    }

    getReportList(params) {
        // return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetListOfReports`, this.httpOptions);
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetReportDataList`, body, this.httpOptions);
    }

}