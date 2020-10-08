import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LoaderState } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderSubject = new Subject<LoaderState>();
  loaderState = this.loaderSubject.asObservable();

  private pageLoaderSubject = new Subject<LoaderState>();
  pageloaderState = this.pageLoaderSubject.asObservable();

  constructor() { }
  show() {
    this.loaderSubject.next(<LoaderState>{ show: true });
  }

  hide() {
    this.loaderSubject.next(<LoaderState>{ show: false });
  }

  pageShow(){
    this.pageLoaderSubject.next(<LoaderState>{show: true});
  }

  pageHide() {
    this.pageLoaderSubject.next(<LoaderState>{ show: false });
  }

}