import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class SharedService {

  private messageSource = new BehaviorSubject<any>([]); // for testing purpose
  currentMessage = this.messageSource.asObservable();

  private selectedAssetSource = new BehaviorSubject<any>([]);
  sharedAsset = this.selectedAssetSource.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  changeSelectedAsset(asset) {
    this.selectedAssetSource.next(asset);
  }

  private modulePermissionSource = new BehaviorSubject<any>([]);
  modulePermission = this.modulePermissionSource.asObservable();

  changeModulePermission(data) {
    this.modulePermissionSource.next(data);
  }

  private realModulesEnabledSource = new BehaviorSubject<any>([]);
  realModulesEnabled = this.realModulesEnabledSource.asObservable();

  changeRealModulesEnabled(data) {
    this.realModulesEnabledSource.next(data);
  }


  private asbestosAttachmetSource = new BehaviorSubject<any>([]);
  asbestosAttachmet = this.asbestosAttachmetSource.asObservable();

  changeAsbestosAttachment(data) {
    this.asbestosAttachmetSource.next(data);
  }


  private asbestosSource = new BehaviorSubject<any>([]);
  asbestos = this.asbestosSource.asObservable();

  changeAsbestos(data) {
    this.asbestosSource.next(data);
  }

  private selectedAsbestosAttachmentSource = new BehaviorSubject<any>([]);
  asbestosAttachmentSource = this.selectedAsbestosAttachmentSource.asObservable();

  changeSelectedAsbestosAttachment(data) {
    this.selectedAsbestosAttachmentSource.next(data);
  }

  private asbestosPortalAccessSource = new BehaviorSubject<any>([]);
  asbestosPortalAccess = this.asbestosPortalAccessSource.asObservable();

  changeAsbestosPortalAccess(data) {
    this.asbestosPortalAccessSource.next(data);
  }

  private energyPortalAccessSource = new BehaviorSubject<any>([]);
  energyPortalAccess = this.energyPortalAccessSource.asObservable();

  changeEnergyPortalAccess(data) {
    this.energyPortalAccessSource.next(data);
  }

  private worksOrdersAccessSource = new BehaviorSubject<any>([]);
  worksOrdersAccess = this.worksOrdersAccessSource.asObservable();

  changeWorksOrdersAccess(data) {
    this.worksOrdersAccessSource.next(data);
  }

  private asbestosPropertyAccessSource = new BehaviorSubject<any>([]);
  asbestosPropertyAccess = this.asbestosPropertyAccessSource.asObservable();

  changeAsbestosPropertyAccess(data) {
    this.asbestosPropertyAccessSource.next(data);
  }



  private serviceAttachmentSrc = new BehaviorSubject<any>([]);
  serviceNotepadAttachment = this.serviceAttachmentSrc.asObservable();

  changeServiceNotepadAttachment(data) {
    this.serviceAttachmentSrc.next(data);
  }

  private servicePortalSrc = new BehaviorSubject<any>([]);
  servicePortalObs = this.servicePortalSrc.asObservable();

  changeServicePortalObs(data) {
    this.servicePortalSrc.next(data);
  }


  private soringBandsListSrc = new BehaviorSubject<any>([]);
  scoringBandObs = this.soringBandsListSrc.asObservable();

  changeScoringBands(data) {
    this.soringBandsListSrc.next(data);
  }

  private hnsPortalSecurityListSrc = new BehaviorSubject<any>([]);
  hnsPortalSecurityList = this.hnsPortalSecurityListSrc.asObservable();

  changeHnsPortalSecurityList(data) {
    this.hnsPortalSecurityListSrc.next(data)
  }

  private tasksPortalSecuritySrc = new BehaviorSubject<any>([]);
  taskPortalSecList = this.tasksPortalSecuritySrc.asObservable();

  changeTaskPortalSecurityList(data) {
    this.tasksPortalSecuritySrc.next(data)
  }


  private surveyPortalSecurityListSrc = new BehaviorSubject<any>([]);
  surveyPortalSecurityList = this.surveyPortalSecurityListSrc.asObservable();

  changeSurveyPortalSecurityList(data) {
    this.surveyPortalSecurityListSrc.next(data);
  }

  private resultHeaderFilters = new BehaviorSubject<any>([]);
  resultHeaderFiltersList = this.resultHeaderFilters.asObservable();

  changeResultHeaderFilters(data) {
    this.resultHeaderFilters.next(data)
  }

  private filterActionGrid = new BehaviorSubject<boolean>(false);
  filterActionGridEvent = this.filterActionGrid.asObservable();

  changeFilterGrid(data: boolean) {
    this.filterActionGrid.next(data);
  }

  private issueList = new BehaviorSubject<any>([]);
  issueObs = this.issueList.asObservable();

  changeissueList(data: any) {
    this.issueList.next(data);
  }

  private resultPageName = new BehaviorSubject<string>("");
  resPageNameObs = this.resultPageName.asObservable();

  changeResPageName(name) {
    this.resultPageName.next(name);
  }

  private refreshEditAnsIssue = new BehaviorSubject<boolean>(false);
  refreshEditAnsObs = this.refreshEditAnsIssue.asObservable();

  refresEidtAnsIssList(data) {
    this.refreshEditAnsIssue.next(data);
  }

  private notifyuserListOnTaskSrc = new BehaviorSubject<any>([]);
  notifyUserList = this.notifyuserListOnTaskSrc.asObservable();

  changeNotifyUserList(data) {
    this.notifyuserListOnTaskSrc.next(data)
  }


  private notificationSrc = new BehaviorSubject<any>([]);
  userNotification = this.notificationSrc.asObservable();

  changeUserNotification(data) {
    this.notificationSrc.next(data)
  }

  private webReporterSrc = new BehaviorSubject<any>([]);
  webReporterObs = this.webReporterSrc.asObservable();

  changeWebReporterPermissionData(data) {
    this.webReporterSrc.next(data);
  }


  private apexPortalSrc = new BehaviorSubject<any>([]);
  apexPortalObs = this.apexPortalSrc.asObservable();

  changeApexPortalPermissionData(data) {
    this.apexPortalSrc.next(data);
  }


}
