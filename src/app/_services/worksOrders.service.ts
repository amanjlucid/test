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

    WEBWorksOrdersValidForNewWorkOrder(WPRSEQUENCE, WOTSEQUENCE, CTTSURCDE, WorksOrderTypes) {
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

    DeleteWebWorkOrder(WOSEQUENCE, reason, userId, checkOrProcess) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/DeleteWebWorkOrder?WOSEQUENCE=${WOSEQUENCE}&reason=${reason}&userId=${userId}&checkOrProcess=${checkOrProcess}`, this.httpOptions);
    }
    WorkOrderAssetDetailPhases(wosequence, wopsequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderAssetDetailPhases?wosequence=${wosequence}&wopsequence=${wopsequence}`, this.httpOptions);
    }

    WorkOrderAssetDetail(wosequence, wopsequence, assid, wochecksurcde) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderAssetDetail?wosequence=${wosequence}&wopsequence=${wopsequence}&assid=${assid}&wochecksurcde=${wochecksurcde}`, this.httpOptions);
    }

    WorksOrderRemoveWork(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderRemoveWork`, params, this.httpOptions);
    }

    WorkOrderUpdateCommentForAttribute(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderUpdateCommentForAttribute`, params, this.httpOptions);
    }

    GetDefaultCostForAssetWork(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetDefaultCostForAssetWork`, params, this.httpOptions);
    }

    WOEditWorkPackageTablet(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WOEditWorkPackageTablet`, params, this.httpOptions);
    }

    RechargeToggle(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/RechargeToggle`, params, this.httpOptions);
    }

    WorkOrderRefusalCodes(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderRefusalCodes?${qs}`, this.httpOptions);
    }
    SetRefusal(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SetRefusal`, params, this.httpOptions);
    }

    GetWorksPackagesForAssets(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorksPackagesForAssets`, params, this.httpOptions);
    }

    WEBWorksOrdersValidateNewWorksOrder(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkordersPortal/WEBWorksOrdersValidateNewWorksOrder`, params, this.httpOptions).toPromise();
    }

    GetWEBWorksOrdersInstructionsForUser(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersInstructionsForUser?${qs}`, this.httpOptions);
    }
    GetWOInstructionAssets(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWOInstructionAssets?${qs}`, this.httpOptions);
    }
    GetWOInstructionAssetsDetails(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWOInstructionAssetsDetails?${qs}`, this.httpOptions);
    }

    WorksOrderAcceptAsset(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderAcceptAsset`, params, this.httpOptions);
    }

    ContractInstructionReport(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/ContractInstructionReport?${qs}`, this.httpOptions);
    }
    EmailContractInstructionReport(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/EmailContractInstructionReport`, params, this.httpOptions);
    }
    WEBWorksOrdersWorksProgrammeLog(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WEBWorksOrdersWorksProgrammeLog?${qs}`, this.httpOptions);
    }

    GetVW_WOReportingProgrammeLog(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetVW_WOReportingProgrammeLog`, params, this.httpOptions);
    }


    WOReportingProgrammeLogDetail(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WOReportingProgrammeLogDetail`, params, this.httpOptions);
    }



    WEBWorksOrdersWorksProgrammeLogDetails(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WEBWorksOrdersWorksProgrammeLogDetails?${qs}`, this.httpOptions);
    }

    GetWEBWorksOrdersAssociations(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersAssociations?${qs}`, this.httpOptions);
    }

    AddAssociation(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/AddAssociation`, params, this.httpOptions);
    }

    EditAssociation(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/EditAssociation`, params, this.httpOptions);
    }

    DeleteAssociation(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/DeleteAssociation`, params, this.httpOptions);
    }
    AddPhaseCostStructure(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/AddPhaseCostStructure`, params, this.httpOptions);
    }

    


}
