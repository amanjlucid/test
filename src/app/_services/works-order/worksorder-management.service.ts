import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';
import { Observable } from 'rxjs';
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

    addWorksOrderPhase(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/InsertWorksOrderPhase`, body, this.httpOptions)
    }

    updateWorksOrderPhase(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/UpdateWorksOrderPhase`, body, this.httpOptions)
    }

    getPhase(WOSEQUENCE, WOPSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorksOrderPhase?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}`, this.httpOptions);

    }

    deletePhase(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/DeleteWorkOrderPhase`, body, this.httpOptions)
    }

    // phaseUpDown(WOSEQUENCE, WOPDISPSEQ, nextPrev) {
    //     return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/PhaseUpDown?WOSEQUENCE=${WOSEQUENCE}&WOPDISPSEQ=${WOPDISPSEQ}&nextPrev=${nextPrev}`, this.httpOptions);
    // }

    phaseUpDown(WOSEQUENCE, WOPSEQUENCE, nextPrev) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/PhaseUpDown?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&nextPrev=${nextPrev}`, this.httpOptions);
    }


    getWorkOrderAsset(params): Observable<any> {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderAsset `, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.assetsViews : [],
                total: (response.data != null) ? response.data.totalCount : 0
            }))
        );
    }

    addWorksOrderAssets(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/AddWorksOrderAssets`, body, this.httpOptions)
    }

    getWorkOrderAssetFromWorklist(params): Observable<any> {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/AssetSearchWorkListWod `, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.wODAssestSearchListViews : [],
                total: (response.data != null) ? response.data.totalCount : 0
            }))
        );
    }


    getWorksPackagesForAssets(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorksPackagesForAssets `, body, this.httpOptions)
    }

    getPlanYear(WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetPlanYear?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    worksOrdersInsertIntoWorkList(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersInsertIntoWorkList  `, body, this.httpOptions)
    }

    addWorksOrderAssetsFromWorkList(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/AddWorksOrderAssetsFromWorkList  `, body, this.httpOptions)
    }

    addWorksOrderAssetsFromWorkListALL(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/AddWorksOrderAssetsFromWorkListALL  `, body, this.httpOptions)
    }

    packageMappingList(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/MappingWorksOrderPackages`, body, this.httpOptions);
    }

    getPackageTemplate(WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetListOfWorksOrderChecklistForWORK?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    selectedOrderMapping(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SelectedOrderMapping`, body, this.httpOptions);
    }

    applyAllWorksOrderPackageMapping(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/ApplyallSelectedOrderMapping`, body, this.httpOptions);
    }

    assetChecklistGridData(wosequence, assid, wopsequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersAssetChecklistsForAsset?wosequence=${wosequence}&assid=${assid}&wopsequence=${wopsequence}`, this.httpOptions);
    }

    getPredecessors(params) {

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersAssetChecklistsForPredecessors`, body, this.httpOptions);

    }

    specificWorkOrderAssets(wosequence, assid, wopsequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/SpecificWorkOrderAssets?wosequence=${wosequence}&assid=${assid}&wopsequence=${wopsequence}`, this.httpOptions);
    }

    setStatus(apiName, params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/${apiName}`, body, this.httpOptions);

    }

    getWOPAssetChecklistDoc(WOSEQUENCE, Assid_WOPSequence_CheckSurcde) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersAssetChecklistFilenameList?WOSEQUENCE=${WOSEQUENCE}&Assid_WOPSequence_CheckSurcde=${Assid_WOPSequence_CheckSurcde}`, this.httpOptions);
    }

    viewDoc(params) {
        // let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetDcocument`, params, this.httpOptions);
        // return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorkOrderDcocument`, params, this.httpOptions);

    }

    updateWorksOrderAssetChecklistDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWorksOrderAssetChecklistDocument`, params, this.httpOptions);
    }

    removeWorksOrderAssetChecklistDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/RemoveWorksOrderAssetChecklistDocument`, params, this.httpOptions);
    }

    getListOfSystemValuesByCode() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetListOfSystemValuesByCode`, this.httpOptions);
    }


    workOrderUploadDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderUploadDocument`, params)
    }

    worksOrderHandoverAsset(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderHandoverAsset`, body, this.httpOptions);
    }

    worksOrderSignOffAsset(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderSignOffAsset`, body, this.httpOptions);
    }

    worksOrderCancelAsset(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderCancelAsset`, body, this.httpOptions);
    }

    worksOrderReleaseAsset(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderReleaseAsset`, body, this.httpOptions);
    }

    worksOrderAcceptAsset(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderAcceptAsset`, body, this.httpOptions);
    }

    worksOrderIssueAsset(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderIssueAsset`, body, this.httpOptions);
    }

    worksOrderRemoveAllWork(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderRemoveAllWork`, body, this.httpOptions);
    }

    workOrderUserSecurity(userId, WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderUserSecurity?userId=${userId}&WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    attachmentExists(sFullFileName) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/AttachmentExists?sFullFileName=${sFullFileName}`, this.httpOptions);
    }


    getActiveAssetTypeList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetActiveAssetTypeList`, this.httpOptions);
    }

    getUserTypeDetails(WOSEQUENCE, WPRSEQUENCE, userid) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetUserDetail?WOSEQUENCE=${WOSEQUENCE}&WPRSEQUENCE=${WPRSEQUENCE}&userid=${userid}`, this.httpOptions);
    }

    SwapPackage(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SwapPackage  `, body, this.httpOptions)
    }

    getAssetAddressForSpecificAsset(WOSEQUENCE, WOPSEQUENCE, assid, WOCHECKSURCDE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetAssetAddressForSpecificAsset?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&assid=${assid}&WOCHECKSURCDE=${WOCHECKSURCDE}`, this.httpOptions);
    }

    //asset address 
    getAssetAddressByAsset(assid) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetAssetAddress?assid=${assid}`, this.httpOptions);
    }

    insertNoAccessRecord(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/InsertNoAccessRecord`, body, this.httpOptions)
    }

    getNoAccessHistory(WOSEQUENCE, WOPSEQUENCE, assid) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetNoAccessHistory?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&assid=${assid}`, this.httpOptions);
    }

    deleteNoAccessRecord(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/DeleteNoAccessRecord`, body, this.httpOptions)
    }


    getWorksOrderPhaseLevelTwo(WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorksOrderPhaseLevelTwo?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    worksOrderMoveAssetPhase(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderMoveAssetPhase`, body, this.httpOptions)
    }

    workOrderPhaseCheckList(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderPhaseCheckList `, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.phaseCheckList : [],
                total: (response.data != null) ? response.data.totalCount : 0
            }))
        );

    }

    getPhaseCheckListFiltersList(WOSEQUENCE, workOnly) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetPhaseCheckListFiltersList?WOSEQUENCE=${WOSEQUENCE}&workOnly=${workOnly}`, this.httpOptions);
    }


    worksOrderAssetSignOff(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderAssetSignOff`, body, this.httpOptions);
    }

    worksOrderRemoveAsset(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderRemoveAsset`, body, this.httpOptions);
    }


    workOrderRefusalCodes(ClearRefusal) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderRefusalCodes?ClearRefusal=${ClearRefusal}`, this.httpOptions);
    }

    getCheckListName(WOSEQUENCE) {
        // return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetStageNameList?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetStageNameList?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    getWEBWorksOrdersVariationList(WOSEQUENCE, WOPSEQUENCE, assId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersVariationList?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&assId=${assId}`, this.httpOptions);
    }

    getWEBWorksOrdersAssetDetailAndVariation(WOSEQUENCE, WOPSEQUENCE, assId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersAssetDetailAndVariation?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&assId=${assId}`, this.httpOptions);
    }

    getWEBWorksOrdersAssetChecklistAndVariation(WOSEQUENCE, WOPSEQUENCE,WOISEQUENCE, assId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersAssetChecklistAndVariation?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}&assId=${assId}`, this.httpOptions);
    }

    getVW_WOUserSecurity(userId, WOSEQUENCE, WPRSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetVW_WOUserSecurity?userId=${userId}&WOSEQUENCE=${WOSEQUENCE}&WPRSEQUENCE=${WPRSEQUENCE}`, this.httpOptions);
    }

    getWOInstructionAssets(WOSEQUENCE, WOISEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWOInstructionAssets?WOSEQUENCE=${WOSEQUENCE}&WOSEQUENCE=${WOSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}`, this.httpOptions);
    }

    worksOrderAcceptVariation(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderAcceptVariation`, body, this.httpOptions);
    }


    worksOrderIssueVariation(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderIssueVariation`, body, this.httpOptions);
    }

    sendVariationToCustomerForReview(WOSEQUENCE, WOISEQUENCE, WONAME, WOIISSUEREASON, strUser) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/SendVariationToCustomerForReview?WOSEQUENCE=${WOSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}&WONAME=${WONAME}&WOIISSUEREASON=${WOIISSUEREASON}&strUser=${strUser}`, this.httpOptions);
    }

    emailVariationToContractorForReview(WOSEQUENCE, WOISEQUENCE, WONAME, WOIISSUEREASON, strUser) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/EmailVariationToContractorForReview?WOSEQUENCE=${WOSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}&WONAME=${WONAME}&WOIISSUEREASON=${WOIISSUEREASON}&strUser=${strUser}`, this.httpOptions);
    }

    deleteBlankVariation(WOSEQUENCE, WOISEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/DeleteBlankVariation?WOSEQUENCE=${WOSEQUENCE}&WOSEQUENCE=${WOSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}`, this.httpOptions);
    }

    getWOInstructionAssetsDetails(WOSEQUENCE, WOISEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWOInstructionAssetsDetails?WOSEQUENCE=${WOSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}`, this.httpOptions);
    }

    addBulkVariation(WOSEQUENCE, WOISEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/AddBulkVariation?WOSEQUENCE=${WOSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}`, this.httpOptions);
    }

    getWorkPackagesForAssetVariation(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWORKS_Packages_for_asset_variation`, body, this.httpOptions);
    }

    insertWorksOrderInstruction(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/InsertWorksOrderInstruction`, body, this.httpOptions);
    }

    updateWorksOrderInstruction(WOSEQUENCE, WOISEQUENCE, WOPSEQUENCE, WOIISSUEREASON) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWorksOrderInstruction?WOSEQUENCE=${WOSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&WOIISSUEREASON=${WOIISSUEREASON}`, this.httpOptions);
    }

    GetWorkOrderGetWorksOrderCompletions(wosequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorksOrderCompletions?wosequence=${wosequence}&struser=${userId}`, this.httpOptions);
    }



    viewWorkOrderCompletionCertificate(wosequence, wocosequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/ViewCompletionCertificate?wosequence=${wosequence}&wocosequence=${wocosequence}&userid=${userId}`, this.httpOptions);
    }

    saveSendWorkOrderCompletionCertificate(wosequence, wocosequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/ProcessCompletionReport?wosequence=${wosequence}&wocosequence=${wocosequence}&userid=${userId}`, this.httpOptions);
    }

    getAppendVariationList(WOSEQUENCE, WOPSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetAppendVariationList?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}`, this.httpOptions);
    }


    worksOrdersCreateVariationForRemoveWOAD(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersCreateVariationForRemoveWOAD`, body, this.httpOptions);
    }


    worksOrdersCreateVariationForChangeCostQty(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersCreateVariationForChangeCostQty`, body, this.httpOptions);
    }

    getContractCostsForAssetAndAttribute(CTTSURCDE, ATAID, ASSID, WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetContractCostsForAssetAndAttribute?CTTSURCDE=${CTTSURCDE}&ATAID=${ATAID}&ASSID=${ASSID}&WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    worksOrdersUpdateWorksOrderInstructionAssetDetail(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersUpdateWorksOrderInstructionAssetDetail`, body, this.httpOptions);
    }

    wORemoveInstructionAssetDetail(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WORemoveInstructionAssetDetail`, body, this.httpOptions);
    }


    worksOrdersCreateVariationForChangeFee(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersCreateVariationForChangeFee`, body, this.httpOptions);
    }

    createVariationForSIMReplacement(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/CreateVariationForSIMReplacement`, body, this.httpOptions);
    }


    worksOrdersCreateVariationForAddWOAD(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersCreateVariationForAddWOAD`, body, this.httpOptions);
    }

    getLatestVariationData(WOSEQUENCE, WOPSEQUENCE, reason) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetLatestVariationData?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&reason=${reason}`, this.httpOptions);
    }

    variationWorkListButtonsAccess(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/VariationWorkListButtonsAccess`, body, this.httpOptions);
    }


    getVariationIndicator(WOSEQUENCE, WOPSEQUENCE, assId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetVariationIndicator?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&assId=${assId}`, this.httpOptions);
    }

    processCompletionReport(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/ProcessCompletionReport`, body, this.httpOptions);
    }






}