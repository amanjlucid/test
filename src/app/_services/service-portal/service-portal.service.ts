import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';


@Injectable()
export class ServicePortalService {

    constructor(private http: HttpClient) { }

    getChartType() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetChartType`, httpOptions);
    }

    getChartData(chartDetail) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(chartDetail);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Chart/GetChartData`, body, httpOptions);
    }

    getSIMManagementSummury(filterParam: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let stDate = filterParam.startDate;
        let enDate = filterParam.endDate;
        let userId = filterParam.userId
        //let body = JSON.stringify(filterParam);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Management/SIMManagementSummury?startDate=${stDate}&endDate=${enDate}&userId=${userId}`, httpOptions);
    }


    GetAssetServiceJobAttributes(attributeDetails) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(attributeDetails);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/GetAssetServiceJobAttributes`, body, httpOptions);
    }

    UpdateAssetAttributeStatus(servicingDetails) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(servicingDetails);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/UpdateAssetAttributeStatus`, body, httpOptions);
    }

    GetAssetServiceJobHistory(attributeDetails) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(attributeDetails);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/GetAssetServiceJobHistory`, body, httpOptions);
    }

    GetServiceAttrInfo(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/GetAssetServiceJobAttributeInfo`, body, httpOptions);
    }

    GetAssetServiceJobInfo(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { Assid, Service_Type_Code } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetServicing/GetAssetServiceJobInfo?Assid=${encodeURIComponent(Assid)}&Service_Type_Code=${Service_Type_Code}`);
    }

    GetVWSimPortalServiceInfoEditItem(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/GetVWSimPortalServiceInfoEditItem`, body, httpOptions);
    }

    AddorEditServiceJobInfo(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/AddorEditServiceJobInfo`, body, httpOptions);
    }

    DeleteServiceJobInfo(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/DeleteServiceJobInfo`, body, httpOptions);
    }

    GetServiceJobNotepadsForAsset(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/GetServiceJobNotepadsForAsset`, body, httpOptions);
    }

    GetNotepadSesCodeList(setCode) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetServicing/GetNotepadSesCodeList?setCode=${setCode}`);
    }

    CheckSesCodeExistsForNotepad(sesCode, serviceTypeCode) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetServicing/CheckSesCodeExistsForNotepad?sesCode=${sesCode}&setCode=${serviceTypeCode}`);
    }

    AddServiceNotepadAttachment(params) {
        // let httpOptions = {
        //     headers: new HttpHeaders({
        //         'Content-Type': 'application/json'
        //     }),
        // };

        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/AddServiceNotepadAttachment`, params);
    }

    RemoveNotepadAttachment(params) {
        let { assid, jobNumber, sequenceNumber } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetServicing/RemoveNotepadAttachment?assid=${assid}&jobNumber=${jobNumber}&sequenceNumber=${sequenceNumber}`);
    }

    UpdateServiceNotepadAttachmentDescription(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetServicing/UpdateServiceNotepadAttachmentDescription`, body, httpOptions);
    }

    GetAssetResidentDetails(Assid) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetServicing/GetAssetResidentDetails?Assid=${Assid}`);
    }

    GetSystemDefaultDate() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Management/GetSystemDefaultDate`);
    }

    getServiceTypeFilter(startDate: any, endDate: any) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetServicing/GetServiceTypeFilter?startDate=${startDate}&endDate=${endDate}`, httpOptions);
    }

    getUserChartData(userId: string, dashboard:string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetUserChartData?userId=${userId}&dashboard=${dashboard}`, httpOptions);
    }

    saveUserChartData(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let userid = params.UserId
        let body = JSON.stringify({ chartData: params.ChartData});
        return this.http.post<any>(`${appConfig.apiUrl}/api/Chart/SaveUserChartData?userId=${userid}&dashboard=${params.dashboard}`, body, httpOptions);
    }

    // getChartExampleDataKeys(chartName:string){
    //     var httpOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/json'
    //         }),
    //     };
    //     return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetChartExampleDataKeys?chartName=${chartName}`, httpOptions);
    // }

    simJobUpdateStatus(jobNumber: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetServicing/SIMJobUpdateStatus?jobNumber=${jobNumber}`, httpOptions);
    }

    getChartParameters() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetChartSParameters`, httpOptions);
    }

}