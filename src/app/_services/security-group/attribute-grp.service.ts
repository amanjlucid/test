import { Injectable } from '@angular/core';
import { Group } from '../../_models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';

@Injectable()
export class AttributeGroupService {
    constructor(private http: HttpClient) { }

    getAllAttributeGroups(groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/AttributeAssociationGroupList?groupId=${groupId}`, httpOptions);
    }


    assigneAttributeGroups(aaG_Code: any, groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        var postData = {
            aaG_Code : aaG_Code,
            GroupId: groupId
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/AssignAttributeAssociationGroup`, body, httpOptions);
    }

}