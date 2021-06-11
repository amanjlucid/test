import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';

@Injectable()
export class WopmConfigurationService {


  httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    }),
  };

  constructor(private http: HttpClient) { }

  getWorksOrdersStageMasterList() {
      return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetWorksOrdersStageMasterList`, this.httpOptions);
  }

  getWorksOrdersTemplateList(status: string, valid: string) {
      return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetWorksOrdersTemplateList?status=${status}&valid=${valid}`, this.httpOptions);
  }

  getWOPMConfigSetting(config: string) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetWOPMConfigSetting?config=${config}`, this.httpOptions);
  }

  updateWOPMTemplate(updateWOPMTemplateParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(updateWOPMTemplateParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UpdateWOPMTemplate`, body, httpOptions);
  }

  copyTemplate(template) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(template);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/CopyTemplate`, body, httpOptions);
  }

  deleteTemplate(template) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(template);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/DeleteTemplate`, body, httpOptions);
  }

  
  updateMasterStage(updateMasterStageParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(updateMasterStageParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UpdateMasterStage`, body, httpOptions);
  }

  moveMasterStage(moveMasterStageParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(moveMasterStageParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/MoveMasterStage`, body, httpOptions);
  }

  getChecklistMaster(wotsequence: number) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetChecklistMaster?wotsequence=${wotsequence}`, this.httpOptions);
  }

  
  
  updateChecklistMaster(updateChecklistMasterParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(updateChecklistMasterParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UpdateChecklistMaster`, body, httpOptions);
  }

  moveChecklistMaster(moveChecklistMasterParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(moveChecklistMasterParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/MoveChecklistMaster`, body, httpOptions);
  }

  validateTemplate(validateTemplateParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(validateTemplateParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/ValidateTemplate`, body, httpOptions);
  }

  
  deleteChecklist(deleteChecklistParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(deleteChecklistParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/DeleteChecklist`, body, httpOptions);
  }

  getChecklistMasterDependencies(wotsequence: number) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetChecklistMasterDependencies?wotsequence=${wotsequence}`, this.httpOptions);
  }


  getChecklistMasterDependenciesSummary(wotsequence: number) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetChecklistMasterDependenciesSummary?wotsequence=${wotsequence}`, this.httpOptions);
  }


  getChecklistMasterDependencyPredecessors(wotsequence: number) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetChecklistMasterDependencyPredecessors?wotsequence=${wotsequence}`, this.httpOptions);
  }

  UpdateChecklistMasterDependencies(updateParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(updateParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UpdateChecklistMasterDependencies`, body, httpOptions);
  }

  
  UpdateChecklistMasterDependency(updateParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(updateParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UpdateChecklistMasterDependency`, body, httpOptions);
  }

  TemplateInterface(interfaceParms) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(interfaceParms);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/TemplateInterface`, body, httpOptions);
  }


  UploadMergeMailDoc(params) {
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UploadMergeMailDoc`, params)
}

  getWorksOrderJobRolesPanelItems() {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetWorksOrderJobRolesPanelItems?`, this.httpOptions);
  }

  getWorksOrdersRefusalCodesList() {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetWorksOrdersRefusalCodesList?`, this.httpOptions);
  }

  getWorksOrdersContractTermsList() {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetWorksOrdersContractTermsList?`, this.httpOptions);
  }

  getWorksOrdersRAGStatusList() {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetWorksOrdersRAGStatusList?`, this.httpOptions);
  }

  getWorksOrderSecurityFunctionsForJobRole(RoleType: string, JobRole: string) {
    return this.http.get<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/GetWorksOrderSecurityFunctionsForJobRole?roletype=${RoleType}&jobrole=${JobRole}`, this.httpOptions);
  }

  updateJobRole(jobRole) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(jobRole);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UpdateWOPMJobRole`, body, httpOptions);
  }

  deleteJobRole(jobRole) {
    let body = JSON.stringify(jobRole);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/DeleteWOPMJobRole`, body, this.httpOptions);
  }

  updateRefusalCode(refusalCode) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(refusalCode);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UpdateWOPMRefusalCode`, body, httpOptions);
  }

  updateContractTerm(contractTerm) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(contractTerm);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UpdateWOPMContractTerm`, body, httpOptions);
  }

  UpdateRAGStatus(ragStatus) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(ragStatus);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/UpdateWOPMRAGStatus`, body, httpOptions);
  }

  DeleteRAGStatus(ragStatus) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(ragStatus);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/DeleteWOPMRAGStatus`, body, httpOptions);
  }

  ActivateRAGStatus(ragStatus) {
    var httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
    };
    let body = JSON.stringify(ragStatus);
    return this.http.post<any>(`${appConfig.apiUrl}/api/WOPMConfiguration/ActivateWOPMRAGStatus`, body, httpOptions);
  }
  
}
