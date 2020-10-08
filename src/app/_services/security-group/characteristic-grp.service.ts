import { Injectable } from '@angular/core';
import { Group } from '../../_models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';

@Injectable()
export class CharacteristicGroupService {
    constructor(private http: HttpClient) { }

    getAllCharacteristicGroups(groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Group/CharacteristicGroupList?groupId=${groupId}`, httpOptions);
    }

    assigneCharacteristicGroups(charGroupId: string, groupId: number) {
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        var postData = {
            Characteristic_Group: charGroupId,
            GroupId: groupId
        };
        let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Group/AssignCharacteristicGroup`, body, httpOptions);
    }

}