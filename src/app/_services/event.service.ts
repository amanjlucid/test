import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { appConfig } from '../app.config';

@Injectable()
export class EventService {
    constructor(private http: HttpClient) { }

    eventUnreadMessageCount(userId: string, businessArea: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        var postData = {
            loggedInUserId: userId,
            businessArea: businessArea
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Event/EventUnreadMessageCount`, body, httpOptions);
    }

    eventSummary(userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Event/EventSummary?userId=${userId}`, httpOptions);
    }


    eventByStatus(userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Event/EventByStatus?userId=${userId}`, httpOptions);
    }

    eventByBusinessArea(userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Event/EventByBusinessArea?userId=${userId}`, httpOptions);
    }


    eventAssignedUser() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Event/EventAssignedUser`, httpOptions);
    }


    eventBySeverity() {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Event/EventBySeverity`, httpOptions);
    }


    dashboardCalanderEvents(userId: string) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/Event/DashboardCalanderEvents?userId=${userId}`, httpOptions);
    }

}