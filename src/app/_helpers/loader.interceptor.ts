import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoaderService } from '../_services';
@Injectable({
  providedIn: 'root'
})

export class LoaderInterceptorService implements HttpInterceptor {
  constructor(private loaderService: LoaderService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.url != undefined) {
      if (req.url.indexOf("GetListOfScheduledParameters") !== -1 && req.url.indexOf("runInBackground") !== -1) {
        return next.handle(req);
      }

      if (
        req.url.indexOf("RunEventManagerProcessAsync") !== -1 ||
        req.url.indexOf("GetEventTypeParameterAndNotify") !== -1 ||
        req.url.indexOf("CreateXportWebReport") !== -1 ||
        req.url.indexOf("EmailReport") !== -1 ||
        req.url.indexOf("WorkOrderUserSecurity") !== -1 ||
        req.url.indexOf("GetUserDetail") !== -1 ||
        req.url.indexOf("VariationWorkListButtonsAccess") !== -1 ||
        req.url.indexOf("CheckEnterValuationButtonVisibility") !== -1
      ) {
        return next.handle(req)
      }

    }

    this.showLoader();
    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        //setTimeout( () => { this.onEnd(); }, 600 );
        this.onEnd();
      }
    },
      (err: any) => {
        this.onEnd();
      }));
  }
  private onEnd(): void {
    this.hideLoader();
  }
  private showLoader(): void {
    this.loaderService.show();
  }
  private hideLoader(): void {
    this.loaderService.hide();
  }
}