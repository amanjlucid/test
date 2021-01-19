import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../app.config';


@Injectable()
export class SettingsService {
    constructor(private http: HttpClient) { }

    updateSystemDefaultConfigurationValues(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/UpdateSystemDefaultConfigurationValues`, body, httpOptions);
    }

    getSettings() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetServicing/GetSystemDefaultConfigurationValues`, httpOptions);
    }

    getSilverLightMenu() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetMenuLinks`, httpOptions);
    }

    getHnsSettings() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetSystemDefaultConfigurationValues`, httpOptions);
    }

    updateHnsSettings(params) {
        // let httpOptions = {
        //     headers: new HttpHeaders({
        //         'Content-Type': 'application/json'
        //     }),
        // };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/HaSUpdateSystemDefaultConfigurationValues`, params);
    }

    GetHaSSettingImages(filePath, pageNumber, numberOfRecord) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetHaSSettingImages?filePath=${filePath}&pageNumber=${pageNumber}&numberOfRecord=${numberOfRecord}`, httpOptions);
    }

    uploadSettingImage(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/UploadSettingImage`, params);
    }


    // Business area api 

    getBusinessAreaList() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/BusinessArea/GetListOfEventBusinessArea`, httpOptions);
    }

    updateListOfEventBusinessArea(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/BusinessArea/UpdateListOfEventBusinessArea`, body, httpOptions);
    }

    // notificaiton

    getNotificationList() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/GetListOfNotificationGroups`, httpOptions);
    }

    validateAddNotificationGroup(groupID, userID) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/ValidateAddNotificationGroup?groupID=${groupID}&userID=${userID}`, httpOptions);
    }


    loadNotificationGroupUser(groupID) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/LoadNotificationGroupUsers?groupID=${groupID}`, httpOptions);
    }

    loadApexUsers() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/LoadApexUsers`, httpOptions);
    }

    validateDeleteNotificationGroup(groupID, userID) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/ValidateDeleteNotificationGroup?groupID=${groupID}&userID=${userID}`, httpOptions);
    }

    ValidateUpdateNotificationGroupDesc(groupID, groupDesc) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/ValidateUpdateNotificationGroupDesc?groupID=${groupID}&groupDesc=${groupDesc}`, httpOptions);
    }

    validateSaveGroupWithNoUsers(groupID) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/ValidateSaveGroupWithNoUsers?groupID=${groupID}`, httpOptions);
    }

    UpdateGroupUserList(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Notification/UpdateGroupUserList`, body, httpOptions);
    }

    updateApexUserEmail(apexUserID, userEmail, userID) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/UpdateApexUserEmail?apexUserID=${apexUserID}&userEmail=${userEmail}&userID=${userID}`, httpOptions);
    }

    ValidateAddNonSecurityUserEmail(userName, userEmail, userID) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/ValidateAddNonSecurityUserEmail?userName=${userName}&userEmail=${userEmail}&userID=${userID}`, httpOptions);
    }

    ValidateUpdateNonSecurityUserEmail(userName, userEmail, userID, nonSecUserId) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/ValidateUpdateNonSecurityUserEmail?userName=${userName}&userEmail=${userEmail}&userID=${userID}&nonSecUserId=${nonSecUserId}`, httpOptions);
    }

    validateDeleteNonSecurityUserEmail(nonSecUserID, userID) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Notification/ValidateDeleteNonSecurityUserEmail?nonSecUserID=${nonSecUserID}&userID=${userID}`, httpOptions);
    }


    // event portal settings api
    eventPortalGetSystemDefaultConfigurationValues(){
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/EventPortalGetSystemDefaultConfigurationValues`, httpOptions);
    }

    eventPortalSettingDefaultValueUpdate(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/UserEvents/EventPortalUpdateSystemDefaultConfigurationValues`, body, httpOptions);
    }

    getWebReporterSystemDefaultConfigurationValues(){
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/WebReportSearch/GetWebReporterSystemDefaultConfigurationValues`, httpOptions);
    }

    updateWebReporterSystemDefaultConfigurationValues(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/WebReportSearch/UpdateWebReporterSystemDefaultConfigurationValues`, body, httpOptions);
    }
}