import { ChangeDetectionStrategy, Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { SubSink } from 'subsink';
import { Group, ElementGroupModel } from '../../_models'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { DomSanitizer } from '@angular/platform-browser';
import saveAs from 'file-saver';
import 'datatables.net';
import 'datatables.net-dt';
import { EmailValidator } from '@angular/forms';
import { AlertService, LoaderService, ReportingGroupService, WebReporterService } from '../../_services';
declare var $: any;

@Component({
  selector: 'app-preview-report',
  templateUrl: './preview-report.component.html',
  styleUrls: ['./preview-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class PreviewReportComponent implements OnInit {
  @Input() openPreviewReport: boolean = false;
  @Input() selectedReport: any;
  @Input() previewFrom: string = 'Report';
  @Output() closePreviewReport = new EventEmitter<boolean>();
  subs = new SubSink();
  currentUser: any;
  reports = [];
  public windowWidth = '900';
  public windowHeight = 'auto';
  public windowTop = '10';
  public emailPreviewWindowTop = '35';
  public emailReportWindowTop = '200';
  public emailWindowWidth = 835;
  public windowLeft = 'auto';
  reportingTable: any;
  reportingType: string = '';
  // preview = 5000;
  public emailWindow = false;
  public emailWithReportWindow = false;
  public selectedItems = [];
  reportsLists = [];
  reportFormat: string = "EXCEL";
  reportDataType = false;
  emailReportsLists: any = [];
  userListToMail: any;
  selectedUsersToMail: any = [];
  exportId: any;
  @ViewChild('pivotCheckBox') pivotCheckBox: ElementRef;
  @ViewChild('emailPreview') emailPreview: any;
  tableSetting = {
    scrollY: '73vh',
    scrollX: '100vh',
    scrollCollapse: true,
    bFilter: false,
    paging: false,
    bInfo: false,
    bPaginate: false,
  }
  dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  emailPreviewForm = {
    subject: null,
    topText: null,
    bottomText: null,
  }

  submitted = false;
  emailReportForm: FormGroup;
  validationMessage = {
    'subject': {
      'required': 'An Email Subject is required.'
    },
    'emailText': {
      'required': 'Email text is required.'
    }
  };

  formErrors: any;
  parameterForPreviewReport: any = { intXportId: '', lstParamNameValue: [''], lngMaxRows: 1000 };

  constructor(
    private fb: FormBuilder,
    private reportingGrpService: ReportingGroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private reportService: WebReporterService
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.previewFrom == 'Report') {
      this.parameterForPreviewReport.intXportId = this.exportId = this.selectedReport.reportId;
      this.reportingType = `${this.exportId} ${this.selectedReport.reportName}`;
    } else {
      this.parameterForPreviewReport.intXportId = this.exportId = this.selectedReport.xportIdentifier;
      this.reportingType = `${this.exportId} ${this.selectedReport.xportName}`;
    }


    this.subs.add(
      this.reportService.getListOfScheduledParameters(this.exportId).subscribe(
        data => {
          console.log(data);
          if (data.isSuccess) {
            const parameters = data.data;
            if (parameters.length > 0) {
              let paramArr: string[] = [];
              let checkValueSet = '';
              parameters.forEach(element => {
                if (checkValueSet == '' && element.paramvalue == "") {
                  checkValueSet = element.extfield;
                }
                paramArr.push(element.extfield)
                paramArr.push(element.paramvalue)
              });
              this.parameterForPreviewReport.lstParamNameValue = [paramArr.toString()];

              if (checkValueSet != '') {
                this.alertService.error(`Missing Parameters: ${checkValueSet}`)
                return
              }
            }
            this.getReport(this.parameterForPreviewReport);
          } else this.alertService.error(data.message);
        },
        err => this.alertService.error(err)
      )
    )


    this.emailReportForm = this.fb.group({
      subject: ['', [Validators.required]],
      emailText: ['', Validators.required],
      userlist: [''],
    });

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeReportingWindow() {
    this.openPreviewReport = false;
    this.closePreviewReport.emit(this.openPreviewReport);
  }


  getReport(params) {
    this.subs.add(
      this.reportService.previewReport(params).subscribe(
        data => {
          console.log(data)
          this.renderTable(data);
        },
        err => this.alertService.error(err)
      )
    )
  }



  renderTable(data) {
    if (this.reportingTable != undefined) {
      this.reportingTable.destroy();
    }
    if (data.length > 0 && data[0].columns != undefined) {
      this.reports = data[0];
      this.chRef.detectChanges();
      const grpTable: any = $('.reportingTable');
      this.reportingTable = grpTable.DataTable(this.tableSetting);
    } else {
      this.loaderService.hide();
      this.alertService.error(data[0].errorMessage);
    }
  }


  reportingPreview(noOfRecords) {
    this.reports = [];
    this.parameterForPreviewReport.lngMaxRows = noOfRecords;
    this.getReport(this.parameterForPreviewReport);
  }

  exportToPdf(saveAs, exportId, lstParamNameValue, userId, pivotCheckBox) {
    this.subs.add(
      this.reportingGrpService.runReport(exportId, lstParamNameValue, userId, "PDF", pivotCheckBox).subscribe(
        data => {
          const linkSource = 'data:application/pdf;base64,' + data;
          const downloadLink = document.createElement("a");
          const fileName = `Xport_${exportId}.pdf`;
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        },
        err => this.alertService.error(err)
      )
    )
  }

  exportToExcel(saveAs, exportId, lstParamNameValue, userId, pivotCheckBox) {
    this.subs.add(
      this.reportingGrpService.runReport(exportId, lstParamNameValue, userId, "EXCEL", pivotCheckBox).subscribe(
        data => {
          const linkSource = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + data;
          if (saveAs) {
            //save document

          } else {
            const downloadLink = document.createElement("a");
            const fileName = `Xport_${exportId}.xlsx`;
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
          }
        },
        err => this.alertService.error(err)
      )
    )
  }

  exportToCsv(saveAs, exportId, lstParamNameValue, userId, pivotCheckBox) {
    this.subs.add(
      this.reportingGrpService.runReport(exportId, lstParamNameValue, userId, "CSV", pivotCheckBox).subscribe(
        data => {
          const linkSource = 'data:attachment/csv;base64,' + data;
          const downloadLink = document.createElement("a");
          const fileName = `Xport_${exportId}.csv`;
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();

        },
        err => this.alertService.error(err)
      )
    )
  }

  runReport(saveAs = false) {
    let pivotCheckBox = this.pivotCheckBox.nativeElement.checked;
    let lstParamNameValue: string[] = this.parameterForPreviewReport.lstParamNameValue;
    if (this.reportFormat == "PDF") {
      this.exportToPdf(saveAs, this.exportId, lstParamNameValue, this.currentUser.userId, pivotCheckBox);
    } else if (this.reportFormat == "EXCEL") {
      this.exportToExcel(saveAs, this.exportId, lstParamNameValue, this.currentUser.userId, pivotCheckBox);
    } else if (this.reportFormat == "CSV") {
      pivotCheckBox = false;
      this.exportToCsv(saveAs, this.exportId, lstParamNameValue, this.currentUser.userId, pivotCheckBox);
    }
  }

  saveReport(reportType) {
    this.reportFormat = reportType;
    let flag = true;
    if (this.reportFormat === "EXCEL") {
      flag = false;
    }
    this.runReport(flag);
  }

  onRadioBtnSelectionChange(radioBtnVal) {
    this.reportFormat = radioBtnVal;
    if (radioBtnVal == "CSV") {
      this.reportDataType = true;
    } else {
      this.reportDataType = false;
    }
  }

  toggleGroupClass(event: any, group) {
    const target = event.target;
    const parent = target.parentNode;
    parent.classList.toggle("selected");
    if (this.reportsLists.includes(group)) {
      this.reportsLists = this.reportsLists.filter(x => x.sequence != group.sequence);
    } else {
      this.reportsLists.push(group);
    }
  }

  public opneEmailAllRecords() {
    this.reportsLists = this.reports['rows'];
    this.userListToEmail(true, true);
  }

  public openEmailWindow() {
    if (this.reportsLists.length > 0 && this.reportsLists != undefined) {
      this.userListToEmail(true, false);
    } else {
      //alert('Please select atleast one record');
      this.alertService.error('Please select atleast one record');
    }
  }

  public userListToEmail(emailPreview, all = null) {
    $('.reportBgblur').addClass('ovrlay');

    // setTimeout(function () {
    //   $('.k-dialog').hide();
    // }, 2000);
    this.subs.add(
      this.reportingGrpService.userListToMail().subscribe(
        data => {
          this.userListToMail = data.data;
          if (emailPreview) {
            this.emailReportsLists['rows'] = this.reportsLists;
            this.emailReportsLists['columns'] = this.reports['columns'];
            this.emailWindow = true;
            if (all != undefined && all) {
              this.reportsLists = [];
              $('.reportingTable tr').removeClass('selected');
            }
          } else {
            this.emailWithReportWindow = true;
          }
          this.chRef.detectChanges();
        }
      )
    )

  }

  onSubmit() {
    //console.log(this.emailPreviewForm);
    if (this.selectedUsersToMail.length > 0 && this.selectedUsersToMail.length != undefined) {
      let htmlBody = $('.htmlData').html();
      this.subs.add(
        this.reportingGrpService.emailPreview(this.selectedUsersToMail, this.emailPreviewForm.subject, htmlBody, this.emailPreviewForm.topText, this.emailPreviewForm.bottomText).subscribe(
          data => {
            //console.log(data);
            if (data.isSuccess) {
              this.closeEmailWindow();
              this.alertService.success('Mail sent successfully');
            } else {
              this.alertService.error(data.message);
            }
          },
          err => this.alertService.error(err)
        )
      )
    } else {
      //alert("Please select atleast one user to send mail");
      this.alertService.error('Please select atleast one user to send mail');
    }
  }


  onEmailReportSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.emailReportForm);

    if (this.emailReportForm.invalid) {
      return;
    }

    if (this.selectedUsersToMail.length == 0) {
      //alert("Please select atleast one user");
      this.alertService.error('Please select atleast one user to send mail');
      return
    }

    let pivotCheckBox = this.pivotCheckBox.nativeElement.checked;
    let lstParamNameValue: string[] = this.parameterForPreviewReport.lstParamNameValue;
    this.reportingGrpService.emailReport(this.exportId, lstParamNameValue, this.currentUser.userId, this.reportFormat, pivotCheckBox, this.selectedUsersToMail, this.emailReportCon.subject.value, this.emailReportCon.emailText.value).subscribe(data => {
      if (data.isSuccess) {
        //console.log(data);
        this.closeEmailWithReportWindow();
        this.alertService.success('Mail sent successfully');
      } else {
        this.alertService.error(data.message);
      }

    })

  }



  public closeEmailWindow() {
    this.emailWindow = false;
    this.emailPreview.reset();
    this.selectedUsersToMail = [];
    $('.reportBgblur').removeClass('ovrlay');
    $('.reportingDiv').removeClass('pointerEvent');
  }

  public openEmailWithReportWindow() {
    this.userListToEmail(false);
  }

  public closeEmailWithReportWindow() {
    this.emailWithReportWindow = false;
    this.emailReportForm.reset();
    this.selectedUsersToMail = [];
    $('.reportBgblur').removeClass('ovrlay');
    $('.reportingDiv').removeClass('pointerEvent');
  }


  public onItemSelect(item: any) {
    this.selectedUsersToMail.push(item);
  }

  public onSelectAll(items: any) {
    this.selectedUsersToMail = items;
  }

  public onItemDeSelect(item: any) {
    this.selectedUsersToMail = this.selectedUsersToMail.filter(x => x.item_id != item.item_id);
  }

  public onItemDeSelectAll(items: any) {
    this.selectedUsersToMail = items;
  }

  // Log report email form validation 
  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid) {
          const messages = this.validationMessage[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    })
  }

  formErrorObject() {
    this.formErrors = {
      'subject': '',
      'emailText': ''
    }
  }

  get emailReportCon() { return this.emailReportForm.controls; }

}
