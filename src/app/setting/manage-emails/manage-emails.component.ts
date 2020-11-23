import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, EventManagerService, HelperService, SettingsService } from '../../_services'
import { DataStateChangeEvent, RowArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-manage-emails',
  templateUrl: './manage-emails.component.html',
  styleUrls: ['./manage-emails.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageEmailsComponent implements OnInit {
  subs = new SubSink();
  @Output() closeEditWin = new EventEmitter<boolean>();
  @Input() manageEmailsWIn: any = false;
  @Input() manageEmailfor:any
  title = "";
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }

  constructor(
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if(this.manageEmailfor == "apex"){
      this.title = "Manage Email Address - Apex Users";
    } else {
      this.title = "Manage Email Address - Non-Apex Users";
    }
  }

}
