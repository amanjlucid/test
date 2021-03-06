import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authenticationService.logout();
                location.reload(true);
            }


            if (err.status == 0) {
                this.authenticationService.logout();
                location.reload(true);
                //return throwError("Connection error.");
            }

           
            if (typeof  err.error.error_description != 'undefined' && err.error.error_description.length > 0) {
                const error = err.error.error_description
                return throwError(error);
            } else {
                const error = err.error.message || err.statusText;
                return throwError(error);
            }
        
        }))
    }
}