import { ChangeDetectionStrategy, Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Group, ElementGroupModel } from '../../_models'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { DomSanitizer } from '@angular/platform-browser';
import saveAs from 'file-saver';
import 'datatables.net';
import 'datatables.net-dt';
import { EmailValidator } from '@angular/forms';
import { AlertService, LoaderService, ReportingGroupService } from '../../_services';
declare var $: any;

@Component({
  selector: 'app-preview-report',
  templateUrl: './preview-report.component.html',
  styleUrls: ['./preview-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewReportComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private reportingGrpService: ReportingGroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
  }

}
