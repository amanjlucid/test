import { Injectable } from '@angular/core';
import { Group } from '../../_models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';

@Injectable()
export class PortalGroupService {
    constructor(private http: HttpClient) { }

    getAllPortaltabas(groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/PortalTabsList?groupId=${groupId}`, httpOptions);
    }


    assignePortalTabGroups(portalId: string, groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        var postData = {
            PortalTabId : portalId,
            GroupId: groupId
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/AssignPortalTabGroup`, body, httpOptions);
    }

}