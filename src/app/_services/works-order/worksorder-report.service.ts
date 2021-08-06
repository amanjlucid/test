import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WorksorderReportService {
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };

    constructor(private http: HttpClient) { }

    WOCreateXportOutput(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/CreateXportOutput`, body, this.httpOptions);
    }

    getChecklistReportForOrder(wprsequence, wosequence, wopsequence, report_level, asset_id) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/GetWorkChecklistReport?wprsequence=${wprsequence}&wosequence=${wosequence}&wopsequence=${wopsequence}&report_level=${report_level}&asset_id=${asset_id}`, this.httpOptions);
    }

    getWOReportingProgSummaryTree(wprsequence, wosequence, level, status = "S") {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/WOReportingProgSummaryTree?wprsequence=${wprsequence}&wosequence=${wosequence}&reporttype=${level}&actInact=${status}`, this.httpOptions);
    }

    getWOReportForAssetLevel(wprsequence, wosequence, wopsequence, level) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/WOReportingAsset?wprsequence=${wprsequence}&wosequence=${wosequence}&wopsequence=${wopsequence}&level=${level}`, this.httpOptions);
    }

    getWOReportingAsset(wprsequence, wosequence, wopsequence, level, status = '') {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/WOReportingAsset?wprsequence=${wprsequence}&wosequence=${wosequence}&wopsequence=${wopsequence}&level=${level}&status=${status}`, this.httpOptions);
    }


}