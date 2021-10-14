import { Injectable } from '@angular/core';
import { Group } from '../../_models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';

@Injectable()
export class ElementGroupService {
    constructor(private http: HttpClient) { }

    getAllElementGroups(groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/GroupElementsList?groupId=${groupId}`, httpOptions);
    }


    assigneElementGroups(elementCode: any, groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        var postData = {
            Element_Code : elementCode,
            GroupId: groupId
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/AssignElementsGroup`, body, httpOptions);
    }

}