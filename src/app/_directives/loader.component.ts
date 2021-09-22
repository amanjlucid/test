import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from '../_services/loader.service';
import { LoaderState } from '../_models/loader';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit, OnDestroy {
  show = false;
  pageShow = false;
  private subscription: Subscription;
  private pageSubscription: Subscription;

  constructor(private loaderService: LoaderService) { }

  ngOnInit() {
    this.subscription = this.loaderService.loaderState
      .subscribe((state: LoaderState) => {
        this.show = state.show;
      });

    this.pageSubscription = this.loaderService.pageloaderState
      .subscribe((state: LoaderState) => {
        this.pageShow = state.show;
      });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.pageSubscription.unsubscribe();
  }
}