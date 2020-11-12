import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class EventManagerService {
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };


    constructor(private http: HttpClient) { }

    getEventTypeList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/GetListOfEventType`, this.httpOptions);

    }

    getListOfEventTypeParameter(eventTypeSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/GetListOfEventTypeParameter?eventTypeSequence=${eventTypeSequence}`, this.httpOptions);

    }

    getListOfEventTypeParameterSelection(EventTypeSequence, EventTypeParamSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/GetListOfEventTypeParameterSelection?eventTypeSequence=${EventTypeSequence}&eventTypeParmSequence=${EventTypeParamSequence}`, this.httpOptions);

    }

    updateListOfEventTypeParameter(EventTypeSequence, EventTypeParamSequence, EventTypeParamSqlValue) {
        let body = JSON.stringify({
            EventTypeSequence: EventTypeSequence,
            EventTypeParamSequence: EventTypeParamSequence,
            EventTypeParamSqlValue: EventTypeParamSqlValue

        });
        return this.http.post<any>(`${appConfig.apiUrl}/api/EventType/UpdateListOfEventTypeParameter`, body, this.httpOptions);

    }


    getAvailableUser() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/GetListOfSecurityUser`, this.httpOptions);
    }

    getAssignUser(eventTypeSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/GetListOfEventTypeNotifyForEventType?eventTypeSequence=${eventTypeSequence}`, this.httpOptions);
    }

    addListOfEventTypeNotify(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/EventType/AddListOfEventTypeNotify`, body, this.httpOptions);
    }

    updateListOfEventTypeNotify(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/EventType/UpdateListOfEventTypeNotify`, body, this.httpOptions);
    }

    deleteListOfEventTypeNotify(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/EventType/DeleteListOfEventTypeNotify`, body, this.httpOptions);
    }

    copyEvent(eventTypeSequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/CopyEventType?eventTypeSequence=${eventTypeSequence}&userId=${userId}`, this.httpOptions);
    }

    runEvent(eventTypeSequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/RunEventManagerProcessAsync?eventTypeSequence=${eventTypeSequence}&userId=${userId}`, this.httpOptions);
    }

    deleteEvent(eventTypeSequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/DeleteEventType?eventTypeSequence=${eventTypeSequence}&userId=${userId}`, this.httpOptions);
    }

    GetListOfSecurityUserAndGroup() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/GetListOfSecurityUserAndGroup`, this.httpOptions);
    }

    deleteSchedule(lstEventTypeSequences, strUserId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/DeleteEventTypeSchedule?lstEventTypeSequences=${lstEventTypeSequences}&strUserId=${strUserId}`, this.httpOptions);
    }

    updateEventList(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/EventType/UpdateListOfEventType`, body, this.httpOptions);
    }

    deleteListOfEventTypeNotifyBySequenceNumber(eventTypeSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/DeleteListOfEventTypeNotifyBySequenceNumber?eventTypeSequence=${eventTypeSequence}`, this.httpOptions);
    }

    getListOfUserEventByUserId(userId, hideComplete) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/GetListOfUserEventByUserId?userId=${userId}&hideComplete=${hideComplete}`, this.httpOptions);
    }

    markViewed(eventSequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/MarkViewed?eventSequence=${eventSequence}&userId=${userId}`, this.httpOptions);
    }

    GetListOfEventManagerUnreadMessage(userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/GetListOfEventManagerUnreadMessage?userId=${userId}`, this.httpOptions);
    }


    getListOfUserEventBySequence(eventSequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/GetListOfUserEventBySequence?eventSequence=${eventSequence}&userId=${userId}`, this.httpOptions);
    }


    UpdateListOfUserEvent(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/UpdateListOfUserEvent`, body, this.httpOptions);
    }

    getFirstRecordOfEventData(eventSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/Manager/GetFirstRecordOfEventData?eventSequence=${eventSequence}`, this.httpOptions);
    }


    getListOfEventData(params): Observable<any> {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/GetListOfEventData`, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.eventDataList : [],
                total: (response.data != null) ? response.data.totalCount : 0
            }))
        );
    }


    exportListOfEventData(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Manager/GetListOfEventData`, body, this.httpOptions);
    }

    UpdateProcessed(eventSequence, eventDataSequence, eventDataStatus, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/UpdateProcessed?eventSequence=${eventSequence}&eventDataSequence=${eventDataSequence}&eventDataStatus=${eventDataStatus}&userId=${userId}`, this.httpOptions);
    }

    markComplete(eventSequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/MarkComplete?eventSequence=${eventSequence}&userId=${userId}`, this.httpOptions);
    }

    assignToMe(eventSequence, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/AssignToMe?eventSequence=${eventSequence}&userId=${userId}`, this.httpOptions);
    }

    transferTo(eventSequence, assignUserId, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/TransferTo?eventSequence=${eventSequence}&assignUserId=${assignUserId}&userId=${userId}`, this.httpOptions);
    }


}