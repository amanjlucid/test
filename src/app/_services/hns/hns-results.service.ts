import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';
import { toODataString } from '@progress/kendo-data-query';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonPipe } from '@angular/common';


@Injectable()
export class HnsResultsService {
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    tableName: string = 'Orders'

    constructor(
        private http: HttpClient,

    ) { }

    getActionGrid(params): Observable<any> {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetActionList`, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.actionList : [],
                total: (response.data != null) ? response.data.totalCount : 0
                // total: (response.data != null ) ? response.data.actionList.length : 0
            }))
        );
    }


    getAssessmentDate(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetAssessmentDate`, body, this.httpOptions)
    }

    getAssessmntQuestionNumbers(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetAssessmntQuestionNumbers`, body, this.httpOptions)
    }

    selectHSAssessmentPositioner(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/SelectHSAssessmentPositioner`, body, this.httpOptions)
    }

    getLatestScoreForAssessment(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetLatestScoreForAssessment`, body, this.httpOptions)
    }

    isQuestionCodeOnActiveSurvey(hasQuestionCode, assId) {
        // let body = JSON.stringify(params);
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/IsQuestionCodeOnActiveSurvey?hasQuestionCode=${hasQuestionCode}&assId=${assId}`, this.httpOptions)
    }

    getSpecificAssetHealthSafetyAnswer(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetSpecificAssetHealthSafetyAnswer`, body, this.httpOptions)
    }

    getSpecificAssetHealthSafetyAnswerArchive(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetSpecificAssetHealthSafetyAnswerArchive  `, body, this.httpOptions)
    }

    getSpecificAns(params, historic = false) {
        if (historic) {
            return this.getSpecificAssetHealthSafetyAnswer(params);
        } else {
            return this.getSpecificAssetHealthSafetyAnswerArchive(params);
        }
    }

    getMultipleAssetHealthSafetyIssue(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetMultipleAssetHealthSafetyIssue`, body, this.httpOptions)
    }


    updateAssetHealtSafetyAnswer(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/UpdateAssetHealtSafetyAnswer`, body, this.httpOptions)
    }

    addAssetHealtSafetyIssueForSingleRecord(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/AddAssetHealtSafetyIssueForSingleRecord`, body, this.httpOptions)
    }

    //addAssetHealtSafetyIssue(params) {
    //    let body = JSON.stringify(params);
    //    return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/AddAssetHealtSafetyIssue`, body, this.httpOptions)
    //}

    updateAssetHealtSafetyIssue(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/UpdateAssetHealtSafetyIssue`, body, this.httpOptions)
    }

    AddAssetHealtSafetyIssueFromAnswer(params) {
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/AddAssetHealtSafetyIssueFromAnswer`, params, this.httpOptions)
    }

    // getMultipleAssetHealthSafetyIssue(params){
    //     let body = JSON.stringify(params);
    //     return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetMultipleAssetHealthSafetyIssue`, body, this.httpOptions)
    // }

    getSpecificAssetHealtSafetyIssue(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetSpecificAssetHealtSafetyIssue`, body, this.httpOptions)
    }

    getScoreTypeForDefinition(Hascode, Hasversion) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetScoreTypeForDefinition?Hascode=${Hascode}&Hasversion=${Hasversion}`, this.httpOptions);
    }

    uploadImagesandDocuments(params) {
        // let body = params//JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/UploadImagesandDocuments`, params)
    }

    getHealthSafetyFileName(assetId) {

        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetHealthSafetyFileName?assetId=${assetId}`, this.httpOptions)
    }

    updateDocumentDescription(assetId, ntpSequence, newDescription) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/UpdateDocumentDescription?assId=${assetId}&ntpSequence=${ntpSequence}&newDescription=${newDescription}`, this.httpOptions)
    }

    GetBinaryFileStreamDirect(fileName) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetBinaryFileStreamDirect?fileName=${fileName}`, this.httpOptions)
    }

    deleteHealthSafetyPicture(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/DeleteHealthSafetyPicture`, body, this.httpOptions)
    }

    getImageForAnswer(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetImageForAnswer`, body, this.httpOptions)
    }

    getSystemValues(pSyvcode) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetSystemValues?pSyvcode=${pSyvcode}`, this.httpOptions)
    }

    deleteHealthSafetyDocument(assId, ntpSequence) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/DeleteHealthSafetyDocument?assId=${assId}&ntpSequence=${ntpSequence}`, this.httpOptions)
    }



    // concode for asset portl service list

    getContractorForUser(userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetContractorForUser?userId=${userId}`, this.httpOptions)
    }

    runReport(postData) {
        //let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetHealthAndSafetyReport`, postData, this.httpOptions);
    }


    getInformationGrid(params): Observable<any> {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/SelectAnswer`, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.actionList : [],
                total: (response.data != null) ? response.data.totalCount : 0
                // total: (response.data != null ) ? response.data.actionList.length : 0
            }))
        );
    }

    getSummary(params): Observable<any> {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/SelectHSSummary`, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.summaryList : [],
                total: (response.data != null) ? response.data.totalCount : 0
                // total: (response.data != null ) ? response.data.actionList.length : 0
            }))
        );
    }

    getAssessment(params): Observable<any> {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/SelectHSAssessment`, body, this.httpOptions).pipe(
            map(response => (<any>{
                data: (response.data != null) ? response.data.assessmentList : [],
                total: (response.data != null) ? response.data.totalCount : 0
                // total: (response.data != null ) ? response.data.actionList.length : 0
            }))
        );
    }


    getAssetText(assId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetAssetText?assId=${assId}`, this.httpOptions)
    }


    updateAssetText(assId, text, userId) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/AddUpdateAssetText?assId=${assId}&text=${text}&userId=${userId}`, this.httpOptions)
    }

    recalculateScore(hasCode, hasVerison, assId, assessmentRef) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/RecalculateScoresForAssessment?hasCode=${hasCode}&hasVerison=${hasVerison}&assId=${assId}&assessmentRef=${assessmentRef}`, this.httpOptions)
    }

    viewDoc(postData) {
        //let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetDcocument`, postData, this.httpOptions);
    }

    validateBudget(hasCode, hasVersion, budgetCode) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/CheckBudgetCodeValidation?hasCode=${hasCode}&hasVersion=${hasVersion}&budgetCode=${budgetCode}`, this.httpOptions)
    }

    displayCustomerColumnsOnAssessment() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/DisplayCustomerColumnsOnAssessment`, this.httpOptions)
    }

    getFloorDropDownList() {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetFloorDropDownList`, this.httpOptions)
    }

    getCharacteristicData(HASCODE, HASVERSION, HASGROUPID, HASHEADINGID, HASQUESTIONID) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetCharacteristicData?HASCODE=${HASCODE}&HASVERSION=${HASVERSION}&HASGROUPID=${HASGROUPID}&HASHEADINGID=${HASHEADINGID}&HASQUESTIONID=${HASQUESTIONID}`, this.httpOptions)
    }

    updateAssetCharacteristic(postData) {
        //let body = JSON.stringify(postData);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/UpdateAssetCharacteristic`, postData, this.httpOptions);
    }

    initiateIssueArchiveUpdate(params) {
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/InitiateIssueArchiveUpdate`, body, this.httpOptions);
    }

    validateReportForRedaction(strAssid, strHasCode, intHasVersion, strAssessmentRef, strLatest) {
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/ValidateReportForRedaction?strAssid=${strAssid}&strHasCode=${strHasCode}&intHasVersion=${intHasVersion}&strAssessmentRef=${strAssessmentRef}&strLatest=${strLatest}`, this.httpOptions)
    }

    //Grid filter column
    gridFilterColumn(){
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetDistinctValuesForStringColumn`, this.httpOptions)
    }

    definitionOrCharFilterCol(columnName = ' '){
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetDistinctValuesForDefinationAndChacode?columnName=${columnName}`, this.httpOptions);
    }

    getHealthSafetyIssueData(Hascode, Hasversion, HasQCode, Assid) {
      return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/GetHealthSafetyIssueData?Hascode=${Hascode}&Hasversion=${Hasversion}&hasQCode=${HasQCode}&assid=${Assid}`, this.httpOptions);
  }

}
