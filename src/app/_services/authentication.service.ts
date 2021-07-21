import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { appConfig } from '../app.config';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class AuthenticationService {

    _userActionOccured: Subject<void> = new Subject();
    get userActionOccured(): Observable<void> { return this._userActionOccured.asObservable() };

    constructor(private http: HttpClient) { }

    login(username: string, password: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };

        var postUser = {
            grant_type: 'password',
            userid: username,
            password: password
        };
        let body = JSON.stringify(postUser);

        return this.http.post<any>(`${appConfig.apiUrl}/api/account/login`, body, httpOptions)
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                //console.log(user)
                if (user && user.access_token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                return user;
            }));
    }


    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('assetFilterObj');
        localStorage.removeItem('worksOrderSingleData');

        //localStorage.removeItem('serviceTypes');
        //localStorage.removeItem('savedState');
        sessionStorage.removeItem('SurvProj');
        sessionStorage.removeItem('SurvBatch');
        sessionStorage.removeItem('SurveyAccess');
        sessionStorage.removeItem('SurvBatchFilters');
        //localStorage.removeItem('layoutCollapsed');
        if (localStorage.getItem('currentUser') != null) {
            var httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                }),
            };
            localStorage.removeItem('currentUser');
            return this.http.post<any>(`${appConfig.apiUrl}/api/Account/Logout`, httpOptions);
        } else {
            localStorage.removeItem('currentUser');
        }

    }

    changePassword(username: string, currentPassword: string, newPassword: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        var changePassword = {
            userid: username,
            password: currentPassword,
            newPassword: newPassword
        };

        let body = JSON.stringify(changePassword);

        return this.http.post<any>(`${appConfig.apiUrl}/api/Account/ChangePassword`, body, httpOptions);

    }


    updateProfile(username: string, newPassword: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };
        var changePassword = {
            userid: username,
            newPassword: newPassword
        };

        let body = JSON.stringify(changePassword);

        return this.http.post<any>(`${appConfig.apiUrl}/api/User/UpdatePassword`, body, httpOptions);

    }


    notifyUserAction() {
        this._userActionOccured.next();
    }


    formAuthentication(userId){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Account/FormAuthentication?userId=${userId}`, httpOptions);
    }

    validateDeepLinkParameters(thirdParty){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/DeepLink/ValidateDeepLinkParameters?ThirdParty=${thirdParty}`, httpOptions);
    }

    validateAssetIDDeepLinkParameters(userId:string, assetId:string){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/ValidateAssetIDDeepLinkParameters?UserID=${userId}&AssetId=${assetId}`, httpOptions);

    }


    checkModulePermission(userId:string){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify({'userId':userId});
        return this.http.post<any>(`${appConfig.apiUrl}/api/Account/ModuleList`,body, httpOptions);
    }

    getRealModulesEnabledList(){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.post<any>(`${appConfig.apiUrl}/api/Account/RealModulesEnabledList`, httpOptions);
    }

    refresUserProp(accessArea:string, userId:string){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/RefreshUserProperties?accessArea=${accessArea}&userId=${userId}`, httpOptions);

    }


}
