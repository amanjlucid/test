import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WebReporterService {
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };

    constructor(private http: HttpClient) { }
    //643292953
    // getEventTypeList() {
    //     return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/GetListOfEventType`, this.httpOptions);
    // }

    // getSelectedTaskData(params) {
    //     // let body = JSON.stringify(params);
    //     return this.http.post<any>(`${appConfig.apiUrl}/api/EventType/GetSelectedTaskData`, params, this.httpOptions);

    // }

    getCategories() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetCategoryList`, this.httpOptions);
    }

    getUserCategory() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/ListXportUserCategories`, this.httpOptions);
    }

    getColumns() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetXportOutputColumnsSelection`, this.httpOptions);
    }

    getReportList(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetReportDataList`, body, this.httpOptions);
    }

    reportCount(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetReportDataListCount`, body, this.httpOptions);
    }

    setFavourite(xportId: number, userName: string, favourite: boolean) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/SetXportAsFavourite?xportId=${xportId}&userName=${userName}&favourite=${favourite}`, this.httpOptions);
    }

    getUserCategoryReport(xportCategory, value = 0) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetUserCategoryDataList?xportCategory=${xportCategory}&value=${value}`, this.httpOptions);
    }

    deleteReportFromCategory(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/DeleteExportCategory`, body, this.httpOptions);
    }

    insertReportInCategory(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/InsertExportCategory`, body, this.httpOptions);
    }

    checkIfUserCategoryExists(userName: string, newCategoryName: string) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/CheckIfUserCategoryExists?userName=${userName}&newCategoryName=${newCategoryName}`, this.httpOptions);
    }

    insertUserCategory(userName: string, newCategoryName: string) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/InsertUserCategory?userName=${userName}&newCategoryName=${newCategoryName}`, this.httpOptions);
    }

    renameUserCategory(userName: string, originalCategoryName: string, newCategoryName: string) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/RenameUserCategory?userName=${userName}&originalCategoryName=${originalCategoryName}&newCategoryName=${newCategoryName}`, this.httpOptions);
    }

    deleteUserCategory(userName: string, categoryName: string) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/DeleteUserCategory?userName=${userName}&categoryName=${categoryName}`, this.httpOptions);
    }

    getListOfScheduledParameters(intXportID: number) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetListOfScheduledParameters?intXportID=${intXportID}`, this.httpOptions);
    }

    getReportParamList(params): Observable<any> {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetXportParameterSelectionColumns`, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.dataTable : [],
                total: (response.data != null) ? response.data.totalCount : 0
            }))
        );;
    }

    updateReportParameter(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/UpdateSavedParameters`, body, this.httpOptions);
    }


    //preview report
    previewReport(preview) {
        // let lstParamNameValue: string[] = [''];
        // let postData = {
        //     intXportId: 536,
        //     lstParamNameValue: lstParamNameValue,
        //     lngMaxRows: preview
        // };
        let body = JSON.stringify(preview);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/CreateXportOutput`, body, this.httpOptions);
    }

    getPublishedReport(intReportId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetListOfPublishedReports?intReportId=${intReportId}`, this.httpOptions);
    }

    deletePublishedReport(xportIdentifier) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/DeletePublishedReport?xportIdentifier=${xportIdentifier}`, this.httpOptions);
    }

    getSchedulingDataByReportId(reportId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetSchedulingDataByReportId?reportId=${reportId}`, this.httpOptions);
    }

    getAllSchedulingDataByReportId(reportId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetAllSchedulingDataByReportId?reportId=${reportId}`, this.httpOptions);
    }

    insertSchedulingReport(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/InsertSchedulingReport`, body, this.httpOptions);
    }

    getSchedulingList(reportId){
        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetSchedulingList?reportId=${reportId}`, this.httpOptions);
    }


}