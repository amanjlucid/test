import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Group, ElementGroupModel } from '../../../_models'
import { AlertService, LoaderService, ReportingGroupService } from '../../../_services'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { DomSanitizer } from '@angular/platform-browser';
import saveAs from 'file-saver';
import 'datatables.net';
import 'datatables.net-dt';
import { EmailValidator } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css']
})
export class ReportingComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private reportingGrpService: ReportingGroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,

  ) { }

  @Input() reportingAction = "";
  @Input() selectedGroup: Group;
  @Input() openReports: boolean = false;
  @Output() closeReportingWin = new EventEmitter<boolean>();

  reports = [];
  public windowWidth = '900';
  public windowHeight = 'auto';
  public windowTop = '10';
  public emailPreviewWindowTop = '35';
  public emailReportWindowTop = '200';
  public emailWindowWidth = 835;
  public windowLeft = 'auto';
  reportingTable: any;
  reportingType: string;
  preview = 5000;
  public emailWindow = false;
  public emailWithReportWindow = false;
  public selectedItems = [];
  reportsLists = [];
  currentUser: any;
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
  public dropdownSettings = {
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

  ngOnInit() {
    this.getReport();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.emailReportForm = this.fb.group({
      subject: ['', [Validators.required]],
      emailText: ['', Validators.required],
      userlist: [''],
    }
    );

  }

  getReport() {
    if (this.reportingAction == "allUserNGroup") {
      this.exportId = 536;
      this.reportingType = "All Users and Groups";
      this.reportingGrpService.allUsersNGroupReport(this.preview).subscribe(
        data => {
          this.renderTable(data);
        }
      )
    } else if (this.reportingAction == "selectedGrpDetail") {
      this.exportId = 585;
      this.reportingType = "Group Details for Selected Group";
      this.reportingGrpService.selectedGroupDetail(this.selectedGroup, this.preview).subscribe(
        data => {
          this.renderTable(data);
        }
      )
    } else if (this.reportingAction == "allGrpDetail") {
      this.exportId = 586;
      this.reportingType = "Group Details for All Groups";
      this.reportingGrpService.allGroupDetails(this.preview).subscribe(
        data => {
          this.renderTable(data);
        }
      )
    }
  }

  closeReportingWindow() {
    this.openReports = false;
    this.closeReportingWin.emit(this.openReports)
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
      this.alertService.error(data.message);
    }
  }


  reportingPreview(noOfRecords) {
    this.reports = [];
    this.preview = noOfRecords;
    this.getReport();
  }

  exportToPdf(saveAs, exportId, lstParamNameValue, userId, pivotCheckBox) {
    this.reportingGrpService.runReport(exportId, lstParamNameValue, userId, "PDF", pivotCheckBox).subscribe(
      data => {
        const linkSource = 'data:application/pdf;base64,' + data;
        const downloadLink = document.createElement("a");
        const fileName = `Xport_${exportId}.pdf`;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      }
    );
  }

  exportToExcel(saveAs, exportId, lstParamNameValue, userId, pivotCheckBox) {
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

      }
    );
  }

  exportToCsv(saveAs, exportId, lstParamNameValue, userId, pivotCheckBox) {
    this.reportingGrpService.runReport(exportId, lstParamNameValue, userId, "CSV", pivotCheckBox).subscribe(
      data => {
        const linkSource = 'data:attachment/csv;base64,' + data;
        const downloadLink = document.createElement("a");
        const fileName = `Xport_${exportId}.csv`;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();

      }
    );
  }

  runReport(saveAs = false) {
    let pivotCheckBox = this.pivotCheckBox.nativeElement.checked;

    if (this.reportingAction == "allUserNGroup") {
      //var exportId = 536;
      var lstParamNameValue: string[] = [''];
    } else if (this.reportingAction == "selectedGrpDetail") {
      //var exportId = 585;
      var lstParamNameValue: string[] = ['Security Group', this.selectedGroup.groupId.toString()];
    } else if (this.reportingAction == "allGrpDetail") {
      //var exportId = 586;
      var lstParamNameValue: string[] = [''];
    }

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
      this.userListToEmail(true,false);
    } else {
      //alert('Please select atleast one record');
      this.alertService.error('Please select atleast one record');
    }
  }

  public userListToEmail(emailPreview, all = null) {
    $('.reportBgblur').addClass('overlay');
    
    setTimeout(function(){
      $('.k-dialog').hide();
    },2000);

    this.reportingGrpService.userListToMail().subscribe(
      data => {
        this.userListToMail = data.data;
        if (emailPreview) {
          this.emailReportsLists['rows'] = this.reportsLists;
          this.emailReportsLists['columns'] = this.reports['columns'];
          this.emailWindow = true;
          if(all != undefined && all){
            this.reportsLists = [];
            $('.reportingTable tr').removeClass('selected');
          }
        } else {
          this.emailWithReportWindow = true;
        }
      }
    );
    
  }

  onSubmit() {
    //console.log(this.emailPreviewForm);
    if (this.selectedUsersToMail.length > 0 && this.selectedUsersToMail.length != undefined) {
     let htmlBody = $('.htmlData').html();
      this.reportingGrpService.emailPreview(this.selectedUsersToMail,this.emailPreviewForm.subject,htmlBody,this.emailPreviewForm.topText,this.emailPreviewForm.bottomText).subscribe(
        data => {
          //console.log(data);
          if(data.isSuccess){
            this.closeEmailWindow();
            this.alertService.success('Mail sent successfully');
          } else {
            this.alertService.error(data.message);
          }
          
        }
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

    if(this.selectedUsersToMail.length == 0){
      //alert("Please select atleast one user");
      this.alertService.error('Please select atleast one user to send mail');
      return
    }

    let pivotCheckBox = this.pivotCheckBox.nativeElement.checked;
    if (this.reportingAction == "allUserNGroup") {
      //var exportId = 536;
      var lstParamNameValue: string[] = [''];
    } else if (this.reportingAction == "selectedGrpDetail") {
      //var exportId = 585;
      var lstParamNameValue: string[] = ['Security Group', this.selectedGroup.groupId.toString()];
    } else if (this.reportingAction == "allGrpDetail") {
      //var exportId = 586;
      var lstParamNameValue: string[] = [''];
    }

    this.reportingGrpService.emailReport(this.exportId, lstParamNameValue, this.currentUser.userId, this.reportFormat, pivotCheckBox, this.selectedUsersToMail, this.emailReportCon.subject.value, this.emailReportCon.emailText.value).subscribe( data => {
      if(data.isSuccess){
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
    $('.reportBgblur').removeClass('overlay');
    $('.reportingDiv').removeClass('pointerEvent');
  }

  public openEmailWithReportWindow() {
    this.userListToEmail(false);
  }

  public closeEmailWithReportWindow() {
    this.emailWithReportWindow = false;
    this.emailReportForm.reset();
    this.selectedUsersToMail = [];
    $('.reportBgblur').removeClass('overlay');
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
