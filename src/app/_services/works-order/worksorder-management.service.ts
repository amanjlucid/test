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


    getWOPAssetDoc(WOSEQUENCE, Assid_WOPSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersAssetFilenameList?WOSEQUENCE=${WOSEQUENCE}&Assid_WOPSequence=${Assid_WOPSequence}`, this.httpOptions);
    }


    viewDoc(params) {
        // let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetDcocument`, params, this.httpOptions);
    }

    updateWorksOrderAssetChecklistDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWorksOrderAssetChecklistDocument`, params, this.httpOptions);
    }

    removeWorksOrderAssetChecklistDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/RemoveWorksOrderAssetChecklistDocument`, params, this.httpOptions);
    }

    updateWorksOrderAssetDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWorksOrderAssetDocument`, params, this.httpOptions);
    }

    removeWorksOrderAssetDocument(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/RemoveWorksOrderAssetDocument`, params, this.httpOptions);
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
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetCheckNameList?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    getWEBWorksOrdersVariationList(WOSEQUENCE, WOPSEQUENCE, assId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersVariationList?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&assId=${assId}`, this.httpOptions);
    }

    getWEBWorksOrdersAssetDetailAndVariation(WOSEQUENCE, WOPSEQUENCE, assId, WOCHECKSURCDE = 0) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersAssetDetailAndVariation?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&assId=${assId}&WOCHECKSURCDE=${WOCHECKSURCDE}`, this.httpOptions);
    }

    getWEBWorksOrdersAssetChecklistAndVariation(WOSEQUENCE, WOPSEQUENCE, WOISEQUENCE, assId) {
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

    worksOrdersCheckVariationValidForProcess(params) {
         let body = JSON.stringify(params);
          return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersCheckVariationValidForProcess`, body, this.httpOptions);
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


    getDefectsIndicator(WOSEQUENCE, WOPSEQUENCE, assId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetDefectsIndicator?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&assId=${assId}`, this.httpOptions);
    }

    processCompletionReport(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/ProcessCompletionReport`, body, this.httpOptions);
    }


    getVW_PROGRAMMES_WORKS_ORDERs(ProgrammesStatus, MPUSID) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Programmes/GetVW_PROGRAMMES_WORKS_ORDERs?ProgrammesStatus=${ProgrammesStatus}&MPUSID=${MPUSID}`, this.httpOptions);
    }

    insertWorksOrderInstructionAssetDetails(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/InsertWorksOrderInstructionAssetDetails`, body, this.httpOptions);
    }


    worksOrdersOutstandingVariationExistsForAsset(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersOutstandingVariationExistsForAsset`, body, this.httpOptions);
    }

    workOrderDefectForAssets(wosequence, assid, wopsequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorkOrderDefectAssets?wosequence=${wosequence}&assid=${assid}&wopsequence=${wopsequence}`, this.httpOptions);
    }

    getWEBWorksOrdersDefectsForProgrammeAndUserSingleWO(WPRSEQUENCE, WOSEQUENCE, UserId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersDefects_ForProgrammeAndUserSingleWO?WPRSEQUENCE=${WPRSEQUENCE}&WOSEQUENCE=${WOSEQUENCE}&UserId=${UserId}`, this.httpOptions);
    }

    getWorksOrderDefect(WPRSEQUENCE, WOSEQUENCE, ASSID, WODSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorksOrderDefect?WPRSEQUENCE=${WPRSEQUENCE}&WOSEQUENCE=${WOSEQUENCE}&ASSID=${ASSID}&WODSEQUENCE=${WODSEQUENCE}`, this.httpOptions);
    }

    getServicePkz(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorkPackagesforAssetSIM_Replacement`, body, this.httpOptions);
    }

    updateWorksOrderDefect(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWorksOrderDefect`, body, this.httpOptions);
    }

    insertWorksOrderDefect(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/InsertWorksOrderDefect`, body, this.httpOptions);
    }

    getWOInstructionSpecificAssetsDetails(WOSEQUENCE, WOISEQUENCE, assid) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWOInstructionSpecificAssetsDetails?WOSEQUENCE=${WOSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}&assid=${assid}`, this.httpOptions);
    }

    signOffDefect(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SignOffDefect`, body, this.httpOptions);
    }

    deleteWorksOrderDefect(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/DeleteWorksOrderDefect`, body, this.httpOptions);
    }

    getDefectScoreLimits() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetDefectScoreLimits`, this.httpOptions);
    }

    worksOrdersSecurityUsersList(wosequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersSecurityUsersList?wosequence=${wosequence}`, this.httpOptions);
    }

    getWEBWorksOrdersFilenameList(WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersFilenameList?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    viewWODoc(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorkOrderDcocument`, params, this.httpOptions);
    }

    updateWorksOrderDocument(WOSEQUENCE, NTPSEQUENCE, NewDescription, UserId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWorksOrderDocument?WOSEQUENCE=${WOSEQUENCE}&NTPSEQUENCE=${NTPSEQUENCE}&NewDescription=${NewDescription}&UserId=${UserId}`, this.httpOptions);
    }

    removeWorksOrderDocument(WOSEQUENCE, NTPSEQUENCE, UserId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/RemoveWorksOrderDocument?WOSEQUENCE=${WOSEQUENCE}&NTPSEQUENCE=${NTPSEQUENCE}&UserId=${UserId}`, this.httpOptions);
    }

    getWEBWorksOrdersPhaseDetailAndVariation(WOSEQUENCE, WOPSEQUENCE, WOISEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWEBWorksOrdersPhaseDetailAndVariation?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&WOISEQUENCE=${WOISEQUENCE}`, this.httpOptions);
    }

    worksOrdersCreateVariationForRemoveWOADForMultiple(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrdersCreateVariationForRemoveWOADForMultiple`, body, this.httpOptions);
    }

    wRemoveInstructionAssetDetailForMultiple(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WORemoveInstructionAssetDetailForMultiple`, body, this.httpOptions);
    }
    getReportingCharConfigData1(wosequence: number) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMManagement/GetReportingCharConfigData1?wosequence=${wosequence}`, this.httpOptions);
    }

    getReportingCharConfigData2(searchchar: string) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMManagement/GetReportingCharConfigData2?searchchar=${searchchar}`, this.httpOptions);
    }

    getWorksOrderChecklist(WOSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetWorksOrderChecklist?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
    }

    updateChecklist(updateChecklistParms) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(updateChecklistParms);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateChecklist`, body, httpOptions);
    }


    getCustomerSurveyAnswers(WOSEQUENCE, WOPSEQUENCE, ASSID) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetCustomerSurveyAnswers?WOSEQUENCE=${WOSEQUENCE}&WOPSEQUENCE=${WOPSEQUENCE}&ASSID=${ASSID}`, this.httpOptions);
    }


    updateCustomerSurvey(updateCustomerSurveyParms) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(updateCustomerSurveyParms);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateCustomerSurvey`, body, httpOptions);
    }



    getMergeMailLetter(getMergeMailLetterParms) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(getMergeMailLetterParms);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/GetMergeMailLetter`, body, httpOptions);
    }

    SetWorksOrderAssetTargetDate(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SetWorksOrderAssetTargetDate`, body, this.httpOptions);
    }

    SetWorksOrderAssetPlannedDate(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/SetWorksOrderAssetPlannedDates`, body, this.httpOptions);
    }

    updateWOAssetComment(updateWOAssetCommentParms) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(updateWOAssetCommentParms);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWOAssetComment`, body, httpOptions);
    }


    updateWOAssetChecklistComment(updateWOAssetChecklistCommentParms) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(updateWOAssetChecklistCommentParms);
        return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/UpdateWOAssetChecklistComment`, body, httpOptions);
    }

    GetPaymentScheduleDate(WOSEQUENCE, WPRSEQUENCE) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetPaymentScheduleDate?WOSEQUENCE=${WOSEQUENCE}&WPRSEQUENCE=${WPRSEQUENCE}`, this.httpOptions);
    }

    worksOrderResetAsset(params) {
      let body = JSON.stringify(params);
      return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderResetAsset`, body, this.httpOptions);
  }

  worksOrderUpdateCheckListFee(params) {
    let body = JSON.stringify(params);
    return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/WorksOrderUpdateCheckListFee`, body, this.httpOptions);
  }

  renamePhaseAsset(params) {
    let body = JSON.stringify(params);
    return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/RenamePhaseAsset`, body, this.httpOptions);
  }

  AddGetVariationNote(params) {
    let body = JSON.stringify(params);
    return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/AddGetVariationNote`, body, this.httpOptions);
  }

  workOrderContract_cost(wprsequence, wosequence) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/WorkOrderContract_cost?wprsequence=${wprsequence}&wosequence=${wosequence}`, this.httpOptions);
}


  getChecklistCost(WOSEQUENCE) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/GetChecklistCost?WOSEQUENCE=${WOSEQUENCE}`, this.httpOptions);
}

GetDocumentsUploadEnabled() {
  return this.http.get<any>(`${appConfig.apiUrl}/api/workorderdetails/DocumentsUploadEnabled`, this.httpOptions);
}


}
