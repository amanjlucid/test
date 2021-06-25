import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../app.config';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';


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

    //   WorkOrderRefusalCodes(qs) {
    //   return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderRefusalCodes?${qs}`, this.httpOptions);
    //   }
    //   SetRefusal(params) {
    //   return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SetRefusal`, params, this.httpOptions);
    //   }

    GetWorksPackagesForAssets(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorksPackagesForAssets`, params, this.httpOptions);
    }

    WEBWorksOrdersValidateNewWorksOrder(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkordersPortal/WEBWorksOrdersValidateNewWorksOrder`, params, this.httpOptions).toPromise();
    }


    GetWorkListPage(params): Observable<any> {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkordersPortal/GetWorkListPage `, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.data : [],
                total: (response.data != null) ? response.data.count : 0
            }))
        );


        // .map(item => {
        //     item.plaN_START_DATE = new Date(item.plaN_START_DATE);
        //     item.plaN_END_DATE = new Date(item.plaN_END_DATE);
        //     item.completeD_DATE = new Date(item.completeD_DATE);})
    }


    // realDates(dataList : any[]) : any[] {
    //     return      dataList.map(item => {
    //         item.plaN_START_DATE = new Date(item.plaN_START_DATE);
    //         item.plaN_END_DATE = new Date(item.plaN_END_DATE);
    //         item.completeD_DATE = new Date(item.completeD_DATE);})
    // }

    GetWorksOrderPhases(WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkordersPortal/GetWorksOrderPhases?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    WorkOrderRefusalCodes(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderRefusalCodes?${qs}`, this.httpOptions);
    }

    SetRefusal(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SetRefusal`, params, this.httpOptions);
    }
    SetClearWorkListTag(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkordersPortal/SetClearWorkListTag`, params, this.httpOptions);
    }

    DetachWorkListItem(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkordersPortal/DetachWorkListItem`, params, this.httpOptions);
    }

    CancelWorkListItem(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkordersPortal/CancelWorkListItem`, params, this.httpOptions);
    }

    getWEBWorksOrdersInstructionsForUser(WPRSEQUENCE, iWOSeq, strUserId, Instructions) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersInstructionsForUser?WPRSEQUENCE=${WPRSEQUENCE}&iWOSeq=${iWOSeq}&strUserId=${strUserId}&Instructions=${Instructions}`, this.httpOptions);
    }

    rechargeToggleVariation(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/RechargeToggleVariation`, params, this.httpOptions);
    }


    refusalToggleVariation(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/RefusalToggleVariation`, params, this.httpOptions);
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

    WEBWorksOrdersWorksProgrammeLog(WOSEQUENCE, intWPRSEQUENCE, intWPLSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WEBWorksOrdersWorksProgrammeLog?WOSEQUENCE=${WOSEQUENCE}&intWPRSEQUENCE=${intWPRSEQUENCE}&intWPLSEQUENCE=${intWPLSEQUENCE}`, this.httpOptions);
    }

    GetVW_WOReportingProgrammeLog(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetVW_WOReportingProgrammeLog`, params, this.httpOptions);
    }


    WOReportingProgrammeLogDetail(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WOReportingProgrammeLogDetail`, params, this.httpOptions);
    }

    WEBWorksOrdersWorksProgrammeLogDetails(intWPRSEQUENCE, intWPLSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WEBWorksOrdersWorksProgrammeLogDetails?intWPRSEQUENCE=${intWPRSEQUENCE}&intWPLSEQUENCE=${intWPLSEQUENCE}`, this.httpOptions);
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

    getManageMilestoneData(wosequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetManageMilestone?wosequence=${wosequence}`, this.httpOptions);
    }

    getMilestoneChecklist(wosequence, wopsequence, checksurcde) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetMilestoneChecklist?wosequence=${wosequence}&wopsequence=${wopsequence}&checksurcde=${checksurcde}`, this.httpOptions);
    }

    getWorkOrderClientUserNames(wosequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderClientUserNames?wosequence=${wosequence}`, this.httpOptions);
    }

    updateWorksOrderMilestone(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWorksOrderMilestone`, params, this.httpOptions);
    }

    updateMilestoneItem(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateMilestoneItem`, params, this.httpOptions);
    }

    // GetWEBWorksOrdersPaymentScheduleForWorksOrder(wprsequence, wosequence){
    //     return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersPaymentScheduleForWorksOrder?wprsequence=${wprsequence}&wosequence=${wosequence}`, this.httpOptions);
    // }
    
    bulkUpdateWorksOrderPaymentSchedule(params){
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/BulkUpdateWorksOrderPaymentSchedule`, params, this.httpOptions);
    }
    insertWebWorksOrdersPaymentSchedule(params){
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/InsertWebWorksOrdersPaymentSchedule`, params, this.httpOptions);
    }
    createWebWorksOrdersPaymentSchedule(params){
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WORKSCreatePaymentSchedule`, params, this.httpOptions);
    }


    getWEBWorksOrdersMilestoneNote(WOSEQUENCE, WOPSEQUENCE, WOCHECKSURCDE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersMilestoneNote?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&WOCHECKSURCDE=${WOCHECKSURCDE}`, this.httpOptions);
    }

    wEBWorksOrdersInsertMilestoneNote(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WEBWorksOrdersInsertMilestoneNote`, params, this.httpOptions);
    }

    getWEBWorksOrdersMiletoneFilenameList(wosequence, strWOPandCHECK) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersMiletoneFilenameList?wosequence=${wosequence}&strWOPandCHECK=${strWOPandCHECK}`, this.httpOptions);
    }

    workOrderMileStoneUploadDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderMileStoneUploadDocument`, params)
    }

    removeWorksOrderMilestoneDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/RemoveWorksOrderMilestoneDocument`, params, this.httpOptions);
    }

    updateWorksOrderMilestoneDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWorksOrderMilestoneDocument`, params, this.httpOptions);
    }

    WEBWorksOrdersWorksProgrammeLogForAsset(WPRSEQUENCE, WOSEQUENCE, WOPSEQUENCE, ASSID) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WEBWorksOrdersWorksProgrammeLogForAsset?WPRSEQUENCE=${WPRSEQUENCE}&WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&ASSID=${ASSID}`, this.httpOptions);
    }

    WEBWorksOrdersWorksProgrammeLogProgram(WPRSEQUENCE, WPLSEQUENCE = 0) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WEBWorksOrdersWorksProgrammeLogProgram?WPRSEQUENCE=${WPRSEQUENCE}&WPLSEQUENCE=${WPLSEQUENCE}`, this.httpOptions);
    }

    WOReportingProgSummaryTree(wprsequence, wosequence, reporttype) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WOReportingProgSummaryTree?wprsequence=${wprsequence}&wosequence=${wosequence}&reporttype=${reporttype}`, this.httpOptions);
    }



    GetWEBWorksOrdersPaymentScheduleForWorksOrder(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersPaymentScheduleForWorksOrder?${qs}`, this.httpOptions);
    }

    WorksRefreshPaymentSchedule(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksRefreshPaymentSchedule?${qs}`, this.httpOptions);
    }


    WorksOrdersValidateInsertPayment(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersValidateInsertPayment`, params, this.httpOptions);
    }
    WebWorksOrdersInsertPayment(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WebWorksOrdersInsertPayment`, params, this.httpOptions);
    }
    WorksOrderRefreshAssetValuation(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderRefreshAssetValuation`, params, this.httpOptions);
    }

    GetWebWorksOrdersAssetValuationTotal(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWebWorksOrdersAssetValuationTotal?${qs}`, this.httpOptions);
    }
    GetWebWorksOrdersAssetValuation(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWebWorksOrdersAssetValuation?${qs}`, this.httpOptions);
    }
    SetValuationToZeroPayment(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SetValuationToZeroPayment`, params, this.httpOptions);
    }
    WorksResetPendingSchedule(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksResetPendingSchedule`, params, this.httpOptions);
    }
    GetWebWorksOrderPaymentScheduleDetails(qs) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWebWorksOrderPaymentScheduleDetails?${qs}`, this.httpOptions);
    }
}
