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

    viewContractorReport(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/CreateXportOutput`, body, this.httpOptions);
    }

    getChecklistReportForOrder(wprsequence, wosequence, wopsequence, report_level, asset_id) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/GetWorkChecklistReport?wprsequence=${wprsequence}&wosequence=${wosequence}&wopsequence=${wopsequence}&report_level=${report_level}&asset_id=${asset_id}`, this.httpOptions);
    }

    getWOReportForFinancialStatus(wprsequence, wosequence, level) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/GetWorkReportingProgSummaryTree?wprsequence=${wprsequence}&wosequence=${wosequence}&level=${level}`, this.httpOptions);
    }

    getWOReportForAssetLevel(wprsequence, wosequence, wopsequence, level) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/GetWorksReportingAsset?wprsequence=${wprsequence}&wosequence=${wosequence}&wopsequence=${wopsequence}&level=${level}`, this.httpOptions);
    }

}