import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';


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

    updateEventList(params){
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/EventType/UpdateListOfEventType`, body, this.httpOptions);
    }

    deleteListOfEventTypeNotifyBySequenceNumber(eventTypeSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/EventType/DeleteListOfEventTypeNotifyBySequenceNumber?eventTypeSequence=${eventTypeSequence}`, this.httpOptions);
    }

    getListOfUserEventByUserId(userId, hideComplete) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/UserEvents/GetListOfUserEventByUserId?userId=${userId}&hideComplete=${hideComplete}`, this.httpOptions);
    }

    


}