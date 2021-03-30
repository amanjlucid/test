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

    getListOfUserWorksOrderByUserId(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkordersPortal/UserWorksOrdersList`, body, this.httpOptions)

    }


    getAssetTemplateList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/GetAssetTemplateList`, this.httpOptions);
    }

    GetPhaseTemplateList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/GetPhaseTemplateList`, this.httpOptions);
    }


    getWorkOrderType() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/GetWorkOrderTypeList`, this.httpOptions);
    }


    GetWorkOrderProgrammeList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/GetWorkOrderProgrammeList`, this.httpOptions);
    }


    WorkOrderContractList(bActiveOnly) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/WorkOrderContractList?bActiveOnly=${bActiveOnly}`, this.httpOptions);
    }


    GetNewSourceCodeForWorksOrder() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/GetNewSourceCodeForWorksOrder`, this.httpOptions);
    }



WEBWorksOrdersValidForNewWorkOrder(WPRSEQUENCE,WOTSEQUENCE,CTTSURCDE,WorksOrderTypes) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/WEBWorksOrdersValidForNewWorkOrder?WPRSEQUENCE=${WPRSEQUENCE}&WOTSEQUENCE=${WOTSEQUENCE}&CTTSURCDE=${CTTSURCDE}&WorksOrderType=${WorksOrderTypes}`, this.httpOptions);
}

    InsertWorksOrder(params) {
     return this.http.post<any>(`${appConfig.apiUrl}/api/WorkordersPortal/InsertWorksOrder`, params, this.httpOptions);
   }

   GetWorksOrderByWOsequence(WOSequence) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/GetWorksOrderByWOsequence?WOSequence=${WOSequence}`, this.httpOptions);
  }

  UpdateWorksOrder(params) {
   return this.http.post<any>(`${appConfig.apiUrl}/api/WorkordersPortal/UpdateWorksOrder`, params, this.httpOptions);
 }


 DeleteWebWorkOrder(WOSEQUENCE,reason,userId,checkOrProcess) {
     return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/DeleteWebWorkOrder?WOSEQUENCE=${WOSEQUENCE}&reason=${reason}&userId=${userId}&checkOrProcess=${checkOrProcess}`, this.httpOptions);
 }
 WorkOrderAssetDetailPhases(wosequence,wopsequence) {
     return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderAssetDetailPhases?wosequence=${wosequence}&wopsequence=${wopsequence}`, this.httpOptions);
 }

 WorksOrderRemoveWork(params) {
  return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderRemoveWork`, params, this.httpOptions);
}

}
