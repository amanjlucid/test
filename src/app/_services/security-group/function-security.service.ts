import { Injectable } from '@angular/core';
import { FunctionSecurityModel } from '../../_models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';

@Injectable()
export class FunctionSecurityService {
    constructor(private http: HttpClient) { }

    createSession(groupId, loggedInUserId) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/GroupFunctionsPreLoad?groupID=${groupId}&loggedInUserId=${loggedInUserId}`, httpOptions);
    }

    getFunctionPortals(isWorkOrder) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/PortalDropdownList?isWorkOrder=${isWorkOrder}`, httpOptions);
    }


    getFunctionTypes(isWorkOrder) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/FunctionTypeDropdownList?isWorkOrder=${isWorkOrder}`, httpOptions);
    }


    availableFunctionList(portalName: string, functionType: string, loggedInUserId: string, groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        var postData = {
            portalName: portalName,
            functionType: functionType,
            groupId: groupId,
            loggedInUserId: loggedInUserId

        };
        let body = JSON.stringify(postData);

        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/AvailableFunctionsList`, body, httpOptions);
    }

    assignedFunctionList(portalName: string, functionType: string, loggedInUserId: string, groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        var postData = {
            portalName: portalName,
            functionType: functionType,
            groupId: groupId,
        };
        let body = JSON.stringify(postData);

        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/AssignedFunctionsList`, body, httpOptions);
    }

    includeAvailableFncToAssined(availableFunction:FunctionSecurityModel[]){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(availableFunction);
        
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/UpdateFunctionSecurityList`, body, httpOptions);
    }


    removeAvailableFncFromAssined(assignedFunction:FunctionSecurityModel[]){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(assignedFunction);
        
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/UpdateFunctionSecurityList`, body, httpOptions);
    }

    saveGroupFunctions(groupID, loggedInUserId){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        var postData = {
            groupID: groupID,
            loggedInUserId: loggedInUserId
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/SaveGroupFunctions`, body, httpOptions);
    }

    cancelGroupFunctions(groupID, loggedInUserId){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        var postData = {
            groupID: groupID,
            loggedInUserId: loggedInUserId
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/CancelGroupFunctions`, body, httpOptions);
    }


}