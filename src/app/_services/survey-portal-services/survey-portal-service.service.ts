import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';
import { ProjectsListModel, ProjectSurveysListModel, BatchesListModel, BatchSurveysListModel, SurveyProjectAccessModel, SurveyProjectSettingsModel, SurveyCbcReport } from '../../_models';
import { anyChanged } from '@progress/kendo-angular-common';

@Injectable()
export class SurveyPortalService {

  httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    }),
  };

    constructor(private http: HttpClient) { }

    GetSurveyProjectsList(projectFilterList: ProjectsListModel) {

        let userID  = projectFilterList.UserId;
        let orderBy  = projectFilterList.OrderBy;
        let orderType  = projectFilterList.OrderType;
        let statusFilter  = projectFilterList.StatusFilter;
        let supCodeNameFilter  = projectFilterList.SupCodeNameFilter;
        let settingsFilter = projectFilterList.SettingsFilter;
        let supCodeOnlyFilter = projectFilterList.SupCodeOnlyFilter;
        let pageNo = projectFilterList.PageNo;
        return this.http.get<any>(`${appConfig.apiUrl}/api/Survey/GetSurveyProjectsList?userId=${userID}&orderBy=${orderBy}&orderType=${orderType}&supCodeOnlyFilter=${supCodeOnlyFilter}&statusFilter=${statusFilter}&supCodeNameFilter=${supCodeNameFilter}&settingsFilter=${settingsFilter}&PageNo=${pageNo}`,  this.httpOptions);

    }

    GetSurveyBatchesList(batchesFilterList: BatchesListModel) {

      let supCode  = batchesFilterList.SupCode;
      let orderBy  = batchesFilterList.OrderBy;
      let orderType  = batchesFilterList.OrderType;
      let statusFilter  = batchesFilterList.StatusFilter;
      let batchNameFilter  = batchesFilterList.BatchNameFilter;
      let surveyorNameFilter = batchesFilterList.SurveyorNameFilter;
      let pageNo = batchesFilterList.PageNo;
      let batchOnlyFilter  = batchesFilterList.BatchOnlyFilter;
      return this.http.get<any>(`${appConfig.apiUrl}/api/Survey/GetSurveyBatchesList?supCode=${supCode}&orderBy=${orderBy}&orderType=${orderType}&batchOnlyFilter=${batchOnlyFilter}&statusFilter=${statusFilter}&batchNameFilter=${batchNameFilter}&surveyorNameFilter=${surveyorNameFilter}&PageNo=${pageNo}`,  this.httpOptions);

  }

  GetSurveyBatchesAssetsList(batchSurveysFilterList: BatchSurveysListModel) {

    let supCode  = batchSurveysFilterList.SupCode;
    let subID  = batchSurveysFilterList.SubID;
    let subArcID  = batchSurveysFilterList.SubArcID;
    let orderBy  = batchSurveysFilterList.OrderBy;
    let orderType  = batchSurveysFilterList.OrderType;
    let statusFilter  = batchSurveysFilterList.StatusFilter;
    let startDateFilter  = batchSurveysFilterList.SurveyStartDateFilter;
    let endDateFilter = batchSurveysFilterList.SurveyEndDateFilter;
    let pageNo = batchSurveysFilterList.PageNo;
    return this.http.get<any>(`${appConfig.apiUrl}/api/Survey/GetSurveyBatchAssetsList?supCode=${supCode}&subId=${subID}&subArcId=${subArcID}&orderBy=${orderBy}&orderType=${orderType}&statusFilter=${statusFilter}&surveyStartDateFilter=${startDateFilter}&surveyEndDateFilter=${endDateFilter}&PageNo=${pageNo}`,  this.httpOptions);

  }

  GetSurveyProjectsAssetsList(projectSurveysFilterList: ProjectSurveysListModel) {


  let supCode  = projectSurveysFilterList.SupCode;
  let orderBy  = projectSurveysFilterList.OrderBy;
  let orderType  = projectSurveysFilterList.OrderType;
  let statusFilter  = projectSurveysFilterList.StatusFilter;
  let assetFilter  = projectSurveysFilterList.AssetFilter;
  let addressFilter  = projectSurveysFilterList.AddressFilter;
  let assetTypeFilter  = projectSurveysFilterList.AssetTypeFilter;
  let srvCodeFilter = projectSurveysFilterList.SrvCodeFilter;
  let srvVersionFilter = projectSurveysFilterList.SrvVersionFilter;
  let inSurveysFilter = projectSurveysFilterList.InSurveysFilter;
  let pageNo = projectSurveysFilterList.PageNo;
  return this.http.get<any>(`${appConfig.apiUrl}/api/Survey/GetSurveyProjectAssetList?supCode=${supCode}&orderBy=${orderBy}&orderType=${orderType}&assetFilter=${assetFilter}&addressFilter=${addressFilter}&statusFilter=${statusFilter}&assetTypeFilter=${assetTypeFilter}&srvCodeFilter=${srvCodeFilter}&srvVersionFilter=${srvVersionFilter}&inSurveysFilter=${inSurveysFilter}&PageNo=${pageNo}`,  this.httpOptions);

  }

  GetSurveyPicturesReport(SupCode: string, SubID: number,  SrvCode: string, AssetID: string,  SrvVersion: number,  ReportName: string) {

  return this.http.get<any>(`${appConfig.apiUrl}/api/Survey/GetSurveyPicturesReport?supCode=${SupCode}&SubID=${SubID}&srvCode=${SrvCode}&AssetID=${AssetID}&SrvVersion=${SrvVersion}&ReportName=${ReportName}`,  this.httpOptions);

  }

  GetMobileSettings(SupCode: string) {

  return this.http.get<any>(`${appConfig.apiUrl}/api/Survey/GetMobileSettings?supcode=${SupCode}`,  this.httpOptions);

  }

  GetSurveyProjectAccessList(projectAccessList: SurveyProjectAccessModel) {


    let supCode  = projectAccessList.SupCode;
    let orderBy  = projectAccessList.OrderBy;
    let orderType  = projectAccessList.OrderType;
    let StatusFilter  = projectAccessList.UserStatus;
    let UserIDFilter  = projectAccessList.UserID;
    let UserNameFilter  = projectAccessList.UserName;
    let UserEmailFilter  = projectAccessList.UserEmail;
    let ConNameFilter = projectAccessList.ConName;
    let HasAccessFilter = projectAccessList.HasAccess;
    let pageNo = projectAccessList.PageNo;
    return this.  http.get<any>(`${appConfig.apiUrl}/api/Survey/GetSurveyProjectAccessList?supCode=${supCode}&orderBy=${orderBy}&orderType=${orderType}&userIDFilter=${UserIDFilter}&userNameFilter=${UserNameFilter}&statusFilter=${StatusFilter}&emailFilter=${UserEmailFilter}&conNameFilter=${ConNameFilter}&hasAccessFilter=${HasAccessFilter}&PageNo=${pageNo}`,  this.httpOptions);

  }

  UpdateSurveyProjectAccess(supCode: string, UserID: string) {
  let surveyProjectAccessItem: SurveyProjectAccessModel = {
    'OrderBy': '','OrderType': '','SupCode' : supCode,'HasAccess' : '','UserID' : UserID,'UserName' : '','UserStatus' : '',
    'UserEmail' : '','ConCode' : '','ConName' : '','LoginAllowed' : '',
    PageNo:  0,

    }
    let body = JSON.stringify(surveyProjectAccessItem);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Survey/UpdateSurveyProjectAccess`, body, this.httpOptions);
  }

  GetSurveyProjectSettings(SupCode: string) {
    return this.  http.get<any>(`${appConfig.apiUrl}/api/Survey/GetMobileSettings?supCode=${SupCode}`,  this.httpOptions);
  }

  UpdateProjectSettings(ProjectAccessItem: SurveyProjectSettingsModel) {
      let body = JSON.stringify(ProjectAccessItem);
      return this.http.post<any>(`${appConfig.apiUrl}/api/Survey/UpdateMobileSettings`, body, this.httpOptions);
    }

  GetSurveyingChartsList() {
      return this.http.get<any>(`${appConfig.apiUrl}/api/Survey/GetSurveyingChartsList`, this.httpOptions);

  }

  GetListOfAssetImageNotepads(AssetID: string) {
    return this.  http.get<any>(`${appConfig.apiUrl}/api/Survey/GetListOfAssetImageNotepads?assetid=${AssetID}`,  this.httpOptions);
  }

  GetListOfAssetPDFNotepads(AssetID: string) {
    return this.  http.get<any>(`${appConfig.apiUrl}/api/Survey/GetListOfAssetPDFNotepads?assetid=${AssetID}`,  this.httpOptions);
  }

  CreateCBCReportData(CBCReport: SurveyCbcReport) {
    let body = JSON.stringify(CBCReport);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Survey/CreateCBCReportData`, body, this.httpOptions);
  }

  GenerateCBCReportData(CBCReport: SurveyCbcReport) {
    let body = JSON.stringify(CBCReport);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Survey/GenerateCBCReportData`, body, this.httpOptions);
  }

  UploadSignatureImage(params) {
    //let body = JSON.stringify(para);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Survey/UploadSignatureImage`, params);
  }

  GetSignatureImage(fileName: string) {
    return this.  http.get<any>(`${appConfig.apiUrl}/api/Survey/GetSignatureImage?filename=${fileName}`,  this.httpOptions);
  }

  PreviewCBCReport(reportid: string) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/Survey/PreviewCBCReport?reportid=${reportid}`,  this.httpOptions);

    }

    GetEncryptedDeepLink(portal: string,  userid: string, assetid: string) {
      return this.  http.get<any>(`${appConfig.apiUrl}/api/Survey/GetEncryptedDeepLink?portal=${portal}&userid=${userid}&assetid=${assetid}`,  this.httpOptions);
    }

}
