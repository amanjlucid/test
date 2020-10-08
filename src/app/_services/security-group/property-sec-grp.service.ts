import { Injectable } from '@angular/core';
import { Group } from '../../_models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';

@Injectable()
export class PropertySecurityGroupService {
    constructor(private http: HttpClient) { }

    getAllPropSecGroups(groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/PropertySecurityList?groupId=${groupId}`, httpOptions);
    }

    getPortalDropDownList() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/PortalDropdownListForAsset`, httpOptions);
    }

    getHierarchyTypeList() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/HierarchyTypeList`, httpOptions);
    }

    getHierarchyAllLevel(type) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/GetHierarchyStructure?hitTypeCode=${type}`, httpOptions);
    }


    hierarchyStructureForAsset(hitTypeCode: string, AssetId: string, actualParentId:string = null) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/GetHierarchyStructureForAsset?hitTypeCode=${hitTypeCode}&AssetId=${AssetId}&ActualParentId=${actualParentId}`, httpOptions);
    }


    addPropertySecurity(selectedGroup, userId: string, selectedHiearchyType: string, assetId: string, selectedPortal: string, access: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let accessLevel = "blank";
        if (access) {
            accessLevel = access;
        }
        var postData = {
            GroupId: selectedGroup.groupId,
            HierarchyTypeCode: selectedHiearchyType,
            AssetId: assetId,
            Portal: selectedPortal,
            AccessLevel: accessLevel,
            LoggedInUserId: userId
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/AddPropertySecurity`, body, httpOptions);
    }


    deletePropertySecurity(groupId: number, selectedHiearchyType: string, assetId: string, access: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        var postData = {
            GroupId: groupId,
            HierarchyTypeCode: selectedHiearchyType,
            AssetId: assetId,
            AccessArea: access,

        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/DeletePropertySecurity`, body, httpOptions);
    }

}