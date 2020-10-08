import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';
import { AssetListModel } from '../../_models';

@Injectable()
export class AssetAttributeService {

    constructor(private http: HttpClient) { }

    getAssetTabsList(userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetTabsList?UserID=${userId}`, httpOptions);
    }

    getAssetTypes() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/AssetTypes`, httpOptions);
    }

    getAllAssets(assetList: AssetListModel) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(assetList);
        //console.log(body);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Asset/GetAssetList`, body, httpOptions);
    }

    getExportAssets(assetList: AssetListModel) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(assetList);
        //console.log(body);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Asset/GetAllAssetList`, body, httpOptions);
    }

    getAssetCount(assetList: AssetListModel) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(assetList);
        //console.log(body);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Asset/GetAssetCount`, body, httpOptions);
    }

    getAssetAttributeList(assetId: string, userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetAttributeList?assetId=${encodeURIComponent(assetId)}&userId=${userId}`, httpOptions);
    }

    getAssetAttributeFilters(assetId: string, userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetAttributeFilters?assetId=${encodeURIComponent(assetId)}&userId=${userId}`, httpOptions);
    }

    getAssetAttributeServicingDetail(assetId: string, ATAId: any, jobNumber:any = null) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetAttributeServicingDetail?assetId=${encodeURIComponent(assetId)}&ATAId=${ATAId}&jobNumber=${jobNumber}`, httpOptions);
    }


    getAssetAttributeRepair(assetId: string, ATAId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetAttributeRepair?assetId=${encodeURIComponent(assetId)}&ATAId=${ATAId}`, httpOptions);
    }

    getAssetAttributeWAGDetail(assetId: string, ATAId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetAttributeWAGDetail?assetId=${encodeURIComponent(assetId)}&ATAId=${ATAId}`, httpOptions);
    }

    getAssetAttributeWorkListDetails(assetId: string, ATAId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetAttributeWorkListDetails?assetId=${encodeURIComponent(assetId)}&ATAId=${ATAId}`, httpOptions);
    }

    getAssetCharacteristicList(assetId: string, userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetCharacteristicList?assetId=${encodeURIComponent(assetId)}&userId=${userId}`, httpOptions);
    }


    getAssetCharacteristicFilters(assetId: string, userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetCharacteristicFilters?assetId=${encodeURIComponent(assetId)}&userId=${userId}`, httpOptions);
    }

    getAssetAsbestosList(assetId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetAsbestosList?assetId=${encodeURIComponent(assetId)}`, httpOptions);
    }

    getLatestRDSAPAnswers(assetId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetLatestRDSAPAnswers?assetId=${encodeURIComponent(assetId)}`, httpOptions);
    }

    getLatestRDSAPExtractAssetDetail(assetId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetLatestRDSAPExtractAssetDetail?assetId=${encodeURIComponent(assetId)}`, httpOptions);
    }

    getNotepadImage(type: string, ntpSequence, ntpModifiedTime, description) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/getNotepadImage?type=${type}&ntpSequence=${ntpSequence}&ntpModifiedTime=${ntpModifiedTime}&description=${description}`, httpOptions);
    }

    getAssettNotepadImage(ntpSequence, ntpType, ntpGencode1, ntpGencode2) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/getNotepadImage?ntpSequence=${ntpSequence}&ntpType=${ntpType}&ntpGencode1=${ntpGencode1}&ntpGencode2=${ntpGencode2}`, httpOptions);
    }

    getNotepadFile(type: string, ntpSequence, ntpModifiedTime, description) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetNotepadFile?type=${type}&ntpSequence=${ntpSequence}&ntpModifiedTime=${ntpModifiedTime}&description=${description}`, httpOptions);
    }

    getAssetSurveysFilters(assetId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetSurveysFilters?assetId=${assetId}`, httpOptions);
    }

    getAssetSurveysList(assetId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetSurveysList?assetId=${assetId}`, httpOptions);
    }

    getAssetHSAssessmentFilters(assetId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetHSAssessmentFilters?assetId=${assetId}`, httpOptions);
    }

    getAssetHSAssessmentList(assetId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetHSAssessmentList?assetId=${assetId}`, httpOptions);
    }

    getAssetServicingFilters(assetId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetServicingFilters?assetId=${assetId}`, httpOptions);
    }

    getAssetServicingList(assetId: string, userId) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetServicingList?assetId=${assetId}&userId=${userId}`, httpOptions);
    }


    getAssetHHSRSList(assetId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetHHSRSList?assetId=${assetId}`, httpOptions);
    }

    getAssetWorksManagementList(assetId: string) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetWorksManagementList?assetId=${assetId}`, httpOptions);
    }

    getAssetQualityList(assetId: string) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetQualityList?assetId=${assetId}`, httpOptions);
    }

    getAssetNotepadList(assetId: string, userId: string) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetNotepadList?assetId=${assetId}&userId=${userId}`, httpOptions);
    }

    

    getAssetServicingDetail(assetId: string, jobNumber: number) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/GetAssetServicingDetail?assetId=${assetId}&JobNumber=${jobNumber}`, httpOptions);
    }

    getApexAssetAttributeAvailable(availableAttrModel) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        availableAttrModel.AssetId = encodeURIComponent(availableAttrModel.AssetId);
        let body = JSON.stringify(availableAttrModel);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/GetApexAssetAttributeAvailable`, body, httpOptions);
    }

    apexAddAssetAttribute(attributes) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(attributes);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexAddAssetAttribute`, body, httpOptions);
    }

    apexEditAssetAttribute(attributes) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(attributes);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexEditAssetAttribute`, body, httpOptions);
    }

    apexDeleteAssetAttribute(attributes) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(attributes);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexDeleteAssetAttribute`, body, httpOptions);
    }

    getApexAssetAttributeRepairAvailable(assetId, ataId) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        assetId = encodeURIComponent(assetId);
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetManagement/GetApexAssetAttributeRepairAvailable?assetId=${assetId}&ataid=${ataId}`, httpOptions);
    }


    apexAddAssetAttributeRepair(attributes) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(attributes);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexAddAssetAttributeRepair`, body, httpOptions);
    }


    apexEditAssetAttributeRepair(attributes) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(attributes);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexEditAssetAttributeRepair`, body, httpOptions);
    }

    apexDeleteAssetAttributeRepair(attributes) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(attributes);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexDeleteAssetAttributeRepair`, body, httpOptions);
    }

    getApexAssetCharacteristicAvailable(availableCharModel) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        availableCharModel.AssetId = encodeURIComponent(availableCharModel.AssetId);
        let body = JSON.stringify(availableCharModel);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/GetApexAssetCharacteristicAvailable`, body, httpOptions);
    }

    getFixedCharDropdownList(Charcode) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetManagement/GetFixedCharDropdownList?Charcode=${Charcode}`, httpOptions);
    }

    apexAddAssetCharacteristic(char) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(char);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexAddAssetCharacteristic`, body, httpOptions);
    }

    apexEditAssetCharacteristic(char) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(char);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexEditAssetCharacteristic`, body, httpOptions);
    }

    apexDeleteAssetCharacteristic(char) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(char);
        return this.http.post<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexDeleteAssetCharacteristic`, body, httpOptions);
    }

    apexGetAssetManagementSecurity(userId: string, portalName = null) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let portal
        if(portalName == null){
            portal = 'Asset Portal' 
        } else {
            portal = portalName;
        }
        
        return this.http.get<any>(`${appConfig.apiUrl}/api/AssetManagement/ApexGetAssetManagementSecurity?UserId=${userId}&Portal=${portal}`, httpOptions);

    }


    individualAssetReport(assetId){
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/AsbestosByLocationReport?Assid=${encodeURIComponent(assetId)}`, httpOptions);
    }



    /** remove these */

    getAssetCountd(assetList: AssetListModel) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(assetList);
        //console.log(body);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Asset/GetAssetCountDummy`, body, httpOptions);
    }

    getAllAssetsd(assetList: AssetListModel) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(assetList);
        //console.log(body);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Asset/GetAssetListDummy`, body, httpOptions);
    }

   

}