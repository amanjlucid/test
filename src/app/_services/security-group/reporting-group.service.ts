import { Injectable } from '@angular/core';
import { Group } from '../../_models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';

@Injectable()
export class ReportingGroupService {
    constructor(private http: HttpClient) { }

    allUsersNGroupReport(preview) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let lstParamNameValue: string[] = [''];
        var postData = {
            intXportId: 536,
            lstParamNameValue: lstParamNameValue,
            lngMaxRows: preview
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/CreateXportOutput`, body, httpOptions);
    }


    selectedGroupDetail(selectedGroup, preview) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let lstParamNameValue: string[] = ['Security Group', selectedGroup.groupId];
        var postData = {
            intXportId: 585,
            lstParamNameValue: lstParamNameValue,
            lngMaxRows: preview
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/CreateXportOutput`, body, httpOptions);
    }

    allGroupDetails(preview) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let lstParamNameValue: string[] = [''];
        var postData = {
            intXportId: 586,
            lstParamNameValue: lstParamNameValue,
            lngMaxRows: preview
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/CreateXportOutput`, body, httpOptions);
    }

    runReport(exportId, lstParamNameValue, userId, format, pivotCheckBox, dataCheckBox) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'responseType': 'arraybuffer' as 'json'
            }),

        };
        var postData = {
            intXportId: exportId,
            lstParamNameValue: lstParamNameValue,
            strUserId: userId,
            reportFormat: format,
            bPivot: pivotCheckBox,
            bExcel: dataCheckBox,
            bChart: false
        };
        let body = JSON.stringify(postData);

        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/CreateXportWebReport`, body, httpOptions);
    }


    previewReport(exportId, lstParamNameValue, userId, format, maxRows) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'responseType': 'arraybuffer' as 'json'
            }),

        };
        var postData = {
            intXportId: exportId,
            lstParamNameValue: lstParamNameValue,
            strUserId: userId,
            reportFormat: format,
            bExcel: true,
            lngMaxRows: maxRows
        };
        let body = JSON.stringify(postData);

        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/GetXportPreview`, body, httpOptions);
    }


    userListToMail() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Report/GetUsersListForEmail`, httpOptions);
    }


    emailReport(exportId, lstParamNameValue, userId, format, pivotCheckBox, userList, subject, emailText) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'responseType': 'arraybuffer' as 'json'
            }),

        };
        var postData = {
            intXportId: exportId,
            lstParamNameValue: lstParamNameValue,
            strUserId: userId,
            reportFormat: format,
            bPivot: pivotCheckBox,
            bExcel: true,
            bChart: false,
            userList:userList,
            subject:subject,
            body:emailText,
            priority:"H"
        };
        let body = JSON.stringify(postData);
        //console.log(body);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/EmailReport`, body, httpOptions);
    }


    emailPreview(userList, subject, emailBody, topText, bottomText) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'responseType': 'arraybuffer' as 'json'
            }),

        };
        var postData = {
            userList:userList,
            subject:subject,
            body:emailBody,
            topText:topText,
            bottomText:bottomText,
            priority:"H"
        };
        let body = JSON.stringify(postData);
        console.log(body);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/EmailPreview`, body, httpOptions);
    }

    RunSurveyPortalXports(xportID: number, Params: string[], preview)
    {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let lstParamNameValue: string[] = Params;
        var postData = {
            intXportId: xportID,
            lstParamNameValue: lstParamNameValue,
            lngMaxRows: preview
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Report/CreateXportOutput`, body, httpOptions);
    }

}