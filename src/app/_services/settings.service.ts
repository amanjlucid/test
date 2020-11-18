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

}