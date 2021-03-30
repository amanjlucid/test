import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-worksorders-add-package-enter-quantity',
  templateUrl: './worksorders-add-package-enter-quantity.component.html',
  styleUrls: ['./worksorders-add-package-enter-quantity.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorksordersAddPackageEnterQuantityComponent implements OnInit {
  subs = new SubSink();
  @Input() packageQuantityWindow: any;
  @Output() closePackageQuantiyEvent = new EventEmitter<boolean>();
  title = 'Add Package Enter Quantity';


  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closePackageQuantityWindow() {
    this.packageQuantityWindow = false;
    this.closePackageQuantiyEvent.emit(this.packageQuantityWindow);
  }

}
