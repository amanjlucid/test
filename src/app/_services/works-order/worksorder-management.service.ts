import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';


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
        return this.http.get<any>(`${appConfig.apiUrl}/api/Programmes/DeleteWorkProgramme?WPRSEQUENCE=${WPRSEQUENCE}&userId=${userId}&CheckOrProcess=${CheckOrProcess}`, this.httpOptions);
    }

    getWorkProgrammesByWprsequence(WPRSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Programmes/GetWorkProgrammesByWprsequence?WPRSequence=${WPRSequence}`, this.httpOptions);
    }


    // Works order detail page service
    getWorksOrderRepairingCharConfigExt(intWOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/GetWorksOrderRepairingCharConfigExt?intWOSEQUENCE=${intWOSEQUENCE}`, this.httpOptions);
    }

    getListOfWorksOrderChecklistForWORK(WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/GetListOfWorksOrderChecklistForWORK?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    worksOrderGetUnallocPhaseBudget(WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/WorksOrderGetUnallocPhaseBudget?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    GetWEBWorksOrdersUserSecurityByWorksOrders(WPRSequence, intWOSEQUENCE, sMPUserID) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/GetWEBWorksOrdersUserSecurityByWorksOrders?intWPRSEQUENCE=${WPRSequence}&intWOSEQUENCE=${intWOSEQUENCE}&sMPUserID=${sMPUserID}`, this.httpOptions);
    }

    getWorkOrderDetails(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/WorkOrderPhase_TreeList`, body, this.httpOptions)
    }

    getWorksOrderByWOsequence(WOSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/GetWorksOrderByWOsequence?WOSequence=${WOSequence}`, this.httpOptions);
    }

    addWorksOrderPhase(params){
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/InsertWorksOrderPhase`, body, this.httpOptions)
    }

    updateWorksOrderPhase(params){
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/UpdateWorksOrderPhase`, body, this.httpOptions)
    }

    getPhase(WOSEQUENCE, WOPSEQUENCE){
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorksOrderPhase?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}`, this.httpOptions);

    }

    deletePhase(params){
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/DeleteWorkOrderPhase`, body, this.httpOptions)
    }

    phaseUpDown(WOSEQUENCE, WOPDISPSEQ, nextPrev){
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/PhaseUpDown?WOSEQUENCE=${WOSEQUENCE}&WOPDISPSEQ=${WOPDISPSEQ}&nextPrev=${nextPrev}`, this.httpOptions);
    }


}