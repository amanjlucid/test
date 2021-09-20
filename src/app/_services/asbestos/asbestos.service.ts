import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpEventType } from '@angular/common/http'
import { map } from 'rxjs/operators';
import { appConfig } from '../../app.config';
import { AsbestosDetailModel, AsbestosAttachmentModel } from '../../_models'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsbestosService {

  constructor(private http: HttpClient) { }

  editAsbestosRequest(asbestos: AsbestosDetailModel) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    asbestos.ASSID = encodeURIComponent(asbestos.ASSID);
    let body = JSON.stringify(asbestos);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/SubmitSingleRequest`, body, httpOptions);
  }

  getActiveAttachment(asbestos: AsbestosDetailModel) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    asbestos.ASSID = encodeURIComponent(asbestos.ASSID);
    let body = JSON.stringify(asbestos);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/GetListOfActiveAsbestosAttachmentsForRequest`, body, httpOptions);
  }

  editAttachment(editObj: any): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(editObj);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/EditAttachment`, body, httpOptions);
  }

  uploadAttachment(formObj): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/AddAttachment`, formObj, {
      reportProgress: true,
      observe: 'events'
    }).pipe(map((event) => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          const progress = Math.round(100 * event.loaded / event.total);
          return { status: 'progress', message: progress, loaded: event };
        case HttpEventType.Response:
          return event.status;
        default:
          return `Unhandled event: ${event.type}`;
      }
    })
    );
  }

  uploadAttachmentTest(formObj): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/AddAttachment`, formObj)

  }

  removeAttachment(attachmentModel) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(attachmentModel);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/RemoveAttachment`, body, httpOptions);
  }


  validateRequest(asbestosDetail: any) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(asbestosDetail);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/ValidateRequest`, body, httpOptions);
  }

  submitSingleRequest(asbestosDetail: any) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(asbestosDetail);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/SubmitSingleRequest`, body, httpOptions);
  }

  getPriorRequestsForACM(asbestosDetail) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(asbestosDetail);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/GetPriorRequestsForACM`, body, httpOptions);
  }

  getAsbestosAttachmentForView(asbestosDetail) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(asbestosDetail);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/GetAsbestosAttachmentForView`, body, httpOptions);
  }


  validateAuthorise(asbestosDetail: any) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(asbestosDetail);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/ValidateAuthorise`, body, httpOptions);
  }


  submitAuthoriseWithAttachments(asbestosDetail: any) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(asbestosDetail);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/SubmitAuthoriseWithAttachments`, body, httpOptions);
  }

  getAssetsAsbestosWorkStatus(assetId: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    return this.http.get<any>(`${appConfig.apiUrl}/api/Asbestos/GetAssetsAsbestosWorkStatus?assid=${encodeURIComponent(assetId)}`, httpOptions);
  }

  updateAssetsAsbestosWorkStatus(workOrder) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(workOrder);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/UpdateAssetsAsbestosWorkStatus`, body, httpOptions);
  }

  updateRequestDescription(asbestos) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(asbestos);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/UpdateRequestDescription`, body, httpOptions);
  }

  dueDiligence(deligence, fromWOPM) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(deligence);
    if(fromWOPM)
    {
      return this.http.post<any>(`${appConfig.apiUrl}/api/workorderdetails/InsertLogRecord`, body, httpOptions);
    }else{
      return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/DueDiligence`, body, httpOptions);
    }
  }

  getAsbestosUserSecurity(userId: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    return this.http.get<any>(`${appConfig.apiUrl}/api/Asset/UserSecurity?userId=${encodeURIComponent(userId)}`, httpOptions);
  }

  SendFurtherInfoRequestEmail(furtherInfo) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    let body = JSON.stringify(furtherInfo);
    return this.http.post<any>(`${appConfig.apiUrl}/api/Asbestos/SendFurtherInfoRequestEmail`, body, httpOptions);
  }




}
