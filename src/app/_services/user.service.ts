import { Injectable } from '@angular/core';
import { User } from '../_models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { appConfig } from '../app.config';

@Injectable()
export class UserService {
    constructor(private http: HttpClient) { }

    getAllUsers() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/User/UserList`, httpOptions);
    }

    getUserGroups(userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/User/GetAssignedGroup?userId=${userId}`, httpOptions);
    }


    // assigneGroup(IsSelected:boolean, selectedUserId:string, GroupId, loginUserid:string){
    //     var httpOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/json'
    //         }),
    //     };

    //     var postData = {
    //         UserId :selectedUserId ,
    //         GroupId : GroupId,
    //         LoggedInUserId : loginUserid,
    //         IsSelected : IsSelected
    //     };

    //     let body = JSON.stringify(postData);
    //     return this.http.post<any>(`${appConfig.apiUrl}/api/User/AssignGroup`, body, httpOptions);
    // }

    assigneGroup(params) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/User/AssignGroup`, body, httpOptions);
    }

    manageUser(user) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        var postData = user;
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/User/ManageUser`, body, httpOptions);
    }

    deleteUser(userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/User/DeleteUser?userId=${userId}`, httpOptions);
    }

    getContractors() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/User/ContractorDropdownList`, httpOptions);
    }



}