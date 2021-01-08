import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';


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
        // return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetListOfReports`, this.httpOptions);
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetReportDataList`, body, this.httpOptions);
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

    // GET api/WebReportSearch/CheckIfUserCategoryExists(string userName, string newCategoryName)
    // GET api/WebReportSearch/InsertUserCategory(string userName, string newCategoryName)
    // GET api/WebReportSearch/RenameUserCategory(string userName, string originalCategoryName, string newCategoryName)
    // GET api/WebReportSearch/DeleteUserCategory(string userName, string categoryName)


}