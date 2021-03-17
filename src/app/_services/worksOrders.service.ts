import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../app.config';

@Injectable()
export class WorksOrdersService {
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };


    constructor(private http: HttpClient) { }

    getListOfUserWorksOrderByUserId(userId, strActiveInactive) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorders/UserWorksOrdersList?strUserId=${userId}&strActiveInactive=${strActiveInactive}`, this.httpOptions);
    }


    getAssetTemplateList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorders/GetAssetTemplateList`, this.httpOptions);
    }

    GetPhaseTemplateList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorders/GetPhaseTemplateList`, this.httpOptions);
    }


    getWorkOrderType() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorders/GetWorkOrderTypeList`, this.httpOptions);
    }


    GetWorkOrderProgrammeList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorders/GetWorkOrderProgrammeList`, this.httpOptions);
    }


    WorkOrderContractList(bActiveOnly) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorders/WorkOrderContractList?bActiveOnly=${bActiveOnly}`, this.httpOptions);
    }


}
