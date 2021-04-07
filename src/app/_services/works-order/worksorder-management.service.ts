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

    phaseUpDown(WOSEQUENCE, WOPDISPSEQ, nextPrev) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WorkOrderDetails/PhaseUpDown?WOSEQUENCE=${WOSEQUENCE}&WOPDISPSEQ=${WOPDISPSEQ}&nextPrev=${nextPrev}`, this.httpOptions);
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

}