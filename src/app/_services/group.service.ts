import { Injectable } from '@angular/core';
import { Group } from '../_models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { appConfig } from '../app.config';

@Injectable()
export class GroupService {
    constructor(private http: HttpClient) { }

    getAllGroups() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/GroupList`, httpOptions);
    }

    updateSecurityGroup(group: Group) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/UpdateGroupDetail`, group, httpOptions);
    }

    createSecurityGroup(group: Group) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/CreateNewGroup`, group, httpOptions);
    }

    copySecurityGroup(group: Group) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/CopyGroup`, group, httpOptions);
    }

    deleteSecurityGroup(groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/DeleteGroup`, groupId, httpOptions);
    }

    validateGroupName(groupName,groupId){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/ValidateGroupUniqueName?groupName=${groupName}&groupId=${groupId}`, httpOptions);
    }


    newGroupList(){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/NewGroupList`, httpOptions);
    }


    groupListByGroupId(groupId){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/GroupListByGroupId?groupId=${groupId}`, httpOptions);
    }


}