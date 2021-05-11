import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AssetAttributeService, AlertService, LoaderService, HelperService, ConfirmationDialogService } from '../../_services'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataResult, process, State, CompositeFilterDescriptor, SortDescriptor, GroupDescriptor } from '@progress/kendo-data-query';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { DateFormatPipe } from 'src/app/_pipes/date-format.pipe';
import { SubSink } from 'subsink';
import { DateValidator, InstValidator, attrQuantityValidation } from 'src/app/_helpers';
import { debounceTime } from 'rxjs/operators';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;


@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.css']
})
export class AttributesComponent implements OnInit, OnDestroy {

  @Input() assetId: string;
  @Input() selectedAsset;
  currentUser;
  fromAttrList: boolean = false;
  repairWin: boolean = false;
  assetAttrWindow: boolean = false;
  assetWorkDetailWindow: boolean = false;
  servicingDetailWindow: boolean = false;
  serviceServicingDetailWindow: boolean = false;
  attributeLists;
  attributeFilterList;
  selectedAttribute:any;
  wagWindow: boolean = false;
  windowWidth = 800;
  touchtime = 0;
  notesDetails: boolean = false;
  selectedNotes;
  notesTitle;
  notesImagePath: SafeResourceUrl;
  state: State = {
    skip: 0,
    sort: [],
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  groups: GroupDescriptor[] = [];
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  public allowUnsort = true;
  public multiple = false;
  public gridView: DataResult;
  actualAttributeLists: any[];
  fileName: string = "attribute.xlsx";
  createAttribute: boolean = false;
  createAttributeForm: FormGroup;
  dataTable: any;
  // attributeListTable: any;
  // tableSetting = {
  //   paging: false,
  //   searching: true,
  //   info: false,
  //   colReorder: true,
  //   scrollY: '5vh',
  // }
  submitted: boolean = false;
  validationMessage = {
    'installationDate': {
      'required': 'Installation Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'futureDate': 'Installation Date cannot be in the future.',
      'isGeater': 'Installation Date cannot be greater than the Survey or Service Date.'
    },
    'quantity': {
      'required': 'Quantity is required.',
      'quanityInvalid': 'Quantity must be between Min & Max'
    },
    'surveyDate': {
      'required': 'Survey Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'futureDate': 'Survey Date cannot be in the future.'
    },
    'uom': {
      'required': 'UOM is required.',
      'uomInvalid': 'UOM should be limited to an entry of 4 characters.',
      'maxlength': 'UOM should be limited to an entry of 4 characters.',
    },
    'serviceDate': {
      'required': 'Service Date is required.',
      'invalidDate': 'Please insert date in dd/mm/yyyy format.',
      'futureDate': 'Service Date cannot be in the future.'
    },
    'dataSource': {
      'required': 'DataSource is required.',
      'maxlength': 'DataSource should be limited to an entry of 1 characters.',
    },
    'generatorRepairs': {
      'required': 'GeneratorRepairs allowed is required.',
    },
    'status': {
      'required': 'status is required.',
    }
  };
  formErrors: any;
  createAttrSaveMsg: string = '';
  createAttrTitle: string = '';
  createAttrFormMode: boolean;
  createAttrFormHeight: any;
  availableAttributes: any;
  selectedAvailableAttr: any;
  deleteAttrWin = false
  availableAttrModel = {
    'PageSize': 100,
    'CurrentPage': 0,
    'AssetId': '',
    'OrderBy': 'attcodE1',
    'OrderType': 'Ascending',//Ascending, Descending
    'SearchParam': ''
  }
  scrollLoad = true;
  editFromAssetAttr = false;
  subs = new SubSink(); // to unsubscribe services
  calendarPosition: string = 'top';
  assetManagement: any;


  constructor(
    private assetAttributeService: AssetAttributeService,
    private _sanitizer: DomSanitizer,
    private helper: HelperService,
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private calendar: NgbCalendar
  ) { }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnInit() {

    this.helper.assetManagementSecurityObs.subscribe(data => this.assetManagement = data)
    this.loaderService.pageShow();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getAssetAttribute(this.assetId);
    this.getAttributeFilterList(this.assetId);
    this.helper.selectedAvailableAttributeObs.subscribe(data => this.selectedAvailableAttr = data)



    this.createAttributeForm = this.fb.group({
      installationDate: ['', [Validators.required, DateValidator()]],
      quantity: ['', [Validators.required]],
      surveyDate: ['', [Validators.required, DateValidator()]],
      uom: ['', [Validators.maxLength(4)]],
      serviceDate: ['', DateValidator()],
      dataSource: ['', [Validators.required, Validators.maxLength(1)]],
      generatorRepairs: [''],
      status: [''],
    },
      {
        validator: InstValidator('installationDate', 'surveyDate', 'serviceDate')
      }
    )
    const quantityControl = this.createAttributeForm.get('quantity');
    const uomControl = this.createAttributeForm.get('uom');
    this.subs.add(
      this.createAttributeForm.get('quantity').valueChanges.subscribe(
        val => {
          if (quantityControl.errors == null) {
            if (this.createAttrFormMode && this.selectedAvailableAttr != undefined) {
              let min = this.selectedAvailableAttr.ataequantitylower
              let max = this.selectedAvailableAttr.ataequantityupper
              if (val >= min && val <= max) {
                quantityControl.setErrors(null);
              } else {
                quantityControl.setErrors({ quanityInvalid: true });
              }
            } else if (this.createAttrFormMode == false) {
              let min = this.selectedAttribute.ataLowerLimit
              let max = this.selectedAttribute.ataUpperLimit
              if (val >= min && val <= max) {
                quantityControl.setErrors(null);
              } else {
                quantityControl.setErrors({ quanityInvalid: true });
              }
            } else {
              quantityControl.setErrors(null);
            }

          }
        }
      ),

      this.createAttributeForm.get('uom').valueChanges.subscribe(
        val => {
          if (val != "" && val != null) {
            const uomVal = val.trim();
            if (uomVal.length > 4) {
              uomControl.setErrors({ maxlength: true });
            } else {
              uomControl.setErrors(null);
            }
          }
        }
      ),
    )

  }

  checkAssetManagement() {
    this.subs.add(
      this.assetAttributeService.apexGetAssetManagementSecurity(this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            this.helper.setAssetManagementSecurity(data.data);
          }
        }
      )
    )
  }

  checkAssetAttributeAccess(param) {
    return this.helper.checkAssetManagementAccess(this.assetManagement, param)
  }


  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.attributeLists, this.state);//process(this.characteristicData, this.state);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.attributeLists, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.attributeLists, this.state);

  }

  getAssetAttribute(assetId: string) {
    let userId = this.currentUser.userId
    this.subs.add(
      this.assetAttributeService.getAssetAttributeList(assetId, userId).subscribe(
        data => {
          this.checkAssetManagement();
          let tempData = data;
          tempData.map(s => {
            s.installationDate = (s.installationDate != "") ? DateFormatPipe.prototype.transform(s.installationDate, 'DD-MMM-YYYY') : s.installationDate;
            s.surveyDate = (s.surveyDate != "") ? DateFormatPipe.prototype.transform(s.surveyDate, 'DD-MMM-YYYY') : s.surveyDate;
            s.lastServiceDate = (s.lastServiceDate != "") ? DateFormatPipe.prototype.transform(s.lastServiceDate, 'DD-MMM-YYYY') : s.lastServiceDate;
            s.dateModified = (s.dateModified != "") ? DateFormatPipe.prototype.transform(s.dateModified, 'DD-MMM-YYYY') : s.dateModified;
          });
          this.attributeLists = tempData;

          this.actualAttributeLists = tempData;
          this.filterAttributes('ALL')
          this.loaderService.pageHide();
          if (this.createAttrFormMode != undefined && !this.createAttrFormMode) {
            const updatedSelAttr = this.actualAttributeLists.find((v) => {
              if (v.attribute == this.selectedAttribute.attribute && v.aagName == this.selectedAttribute.aagName && v.ataId == this.selectedAttribute.ataId) {
                return v;
              }
            });
            this.selectedAttribute = updatedSelAttr
          }

        },
        error => {
          this.loaderService.hide();
          this.loaderService.pageHide();
          //this.alertService.error(error);
        }
      )
    )
  }

  getColor(obj) {
    if (obj.status == "Active") {
      return obj.colour
    } else {
      return 'gray';
    }
  }

  getAttributeFilterList(assetId: string) {
    let userId = this.currentUser.userId
    this.subs.add(
      this.assetAttributeService.getAssetAttributeFilters(assetId, userId).subscribe(
        data => {
          if (data.length > 0) {
            this.attributeFilterList = data;
          }
        }
      )
    )
  }

  filterAttributes(value) {
    let actualchar = this.actualAttributeLists;
    if (value == 'ALL') {
      this.attributeLists = actualchar.filter(c => c.eleName == value);
    } else {
      this.attributeLists = actualchar.filter(c => c.filterValue == value);
    }
    this.gridView = process(this.attributeLists, this.state)
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    if (columnIndex > 1) {
      this.openAssetAttrPopUp(dataItem)
    }
  }

  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (this.gridView.data.length != undefined) {
      if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
        this.fileName = 'attribute.' + fileExt;
        let ignore = [];
        let label = {
          'attribute': 'Attribute',
          'installationDate': 'Installation Date',
          'quantity': 'Qty',
          'uom': 'UOM',
          'repairYear': 'Repair Year',
          'surveyDate': 'Survey Date',
          'lastServiceDate': 'Last Service',
          'dataSource': 'Data Source',
          'modifiedBy': 'Modified By',
          'dateModified': 'Date Modified',
        }

        if (rowSelection != null) {
          if (this.mySelection.length != undefined && this.mySelection.length > 0) {
            let selectedRows = this.gridView.data.filter((v, k) => {
              return this.mySelection.includes(k)
            });
            this.selectedRows = selectedRows;
          } else {
            this.selectedRows = this.gridView.data;
          }
        } else {
          this.selectedRows = this.gridView.data;
        }

        // if (fileExt == 'xlsx' && rowSelection != null) {
        if (fileExt == 'xlsx') {
          //this.helper.exportAsExcelFile(this.selectedRows, 'attribute', label)
          this.helper.exportToexcelWithAssetDetails(this.selectedRows, 'attribute', label)
        } else if (fileExt == 'html') {
          this.helper.exportAsHtmlFile(this.selectedRows, this.fileName, label)
        } else {
          this.helper.exportToCsv(this.fileName, this.selectedRows, ignore, label);
        }

      } else {
        grid.saveAsExcel();
      }
    }
  }


  openAssetAttrPopUp(attr) {
    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 200) {
        // double click occurred
        $('.portalwBlur').addClass('ovrlay');
        this.selectedAttribute = attr;
        this.assetAttrWindow = true;
        this.touchtime = 0;
      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }
  }

  openRepairWindowFromAttrMenuList(attr) {
    $('.portalwBlur').addClass('ovrlay');
    this.selectedAttribute = attr;
    this.fromAttrList = true;
    this.repairWin = true;
    this.assetAttrWindow = true;

  }

  closeRepairWindowFromAttrMenuList($event) {
    this.fromAttrList = $event;
    this.repairWin = $event;
    this.assetAttrWindow = $event;
    $('.portalwBlur').removeClass('ovrlay');
  }

  closeAssetAttrWindow($event) {
    $('.portalwBlur').removeClass('ovrlay');
    this.assetAttrWindow = $event;
  }

  openWorkDetail(attr) {
    $('.portalwBlur').addClass('ovrlay');
    this.selectedAttribute = attr;
    this.assetWorkDetailWindow = true;
  }

  openNotesDetails(notesDetails) {
    this.selectedNotes = notesDetails;

    if (this.selectedNotes.linkType == 'P') {
      $('.portalwBlur').addClass('ovrlay');
      this.notesTitle = "Attribute Image";
      this.assetAttributeService.getNotepadImage(this.selectedNotes.ntpType, this.selectedNotes.ntpGenericCode1, this.selectedNotes.ntpGenericCode2, this.selectedNotes.ntpSequence).subscribe(
        data => {
          this.notesImagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
            'data:image/jpg;base64,' + data);
          this.notesDetails = true;
        }
      )

    } else if (this.selectedNotes.linkType == 'N') {
      $('.portalwBlur').addClass('ovrlay');
      this.notesTitle = "View Notepad Note...";
      this.notesDetails = true;
    } else if (this.selectedNotes.linkType == 'L') {
      let lnk = this.selectedNotes.link;


      let fileExt = lnk.substring(lnk.lastIndexOf(".") + 1).toLowerCase();
      this.assetAttributeService.getMimeType(fileExt).subscribe(
        mimedata => {
          if (mimedata && mimedata.isSuccess && mimedata.data && mimedata.data.fileExtension) {
              var linkSource = 'data:' + mimedata.data.mimeType1 + ';base64,';
              this.assetAttributeService.getNotepadFile(this.selectedNotes.ntpType, this.selectedNotes.ntpGenericCode1, this.selectedNotes.ntpGenericCode2, this.selectedNotes.ntpSequence).subscribe(
                filedata => {
                  if (mimedata.data.openWindow)
                  {
                    var byteCharacters = atob(filedata);
                    var byteNumbers = new Array(byteCharacters.length);
                    for (var i = 0; i < byteCharacters.length; i++) {
                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    var file = new Blob([byteArray], { type: mimedata.data.mimeType1 + ';base64' });
                    var fileURL = URL.createObjectURL(file);
                    let newPdfWindow =window.open(fileURL);

                    // let newPdfWindow = window.open("",this.selectedNotes.fileName);
                    // let iframeStart = "<\iframe title='Notepad' width='100%' height='100%' src='data:" + mimedata.data.mimeType1 + ";base64, ";
                    // let iframeEnd = "'><\/iframe>";
                    // newPdfWindow.document.write(iframeStart + filedata + iframeEnd);
                    // newPdfWindow.document.title = this.selectedNotes.fileName;
                  }
                  else
                  {
                    linkSource = linkSource + filedata;
                    const downloadLink = document.createElement("a");
                    const fileName = this.selectedNotes.fileName;
                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();
                  }
                }
              )
            }
            else{
              this.alertService.error("This file format is not supported.");
            }
        }
      )



    } else if (this.selectedNotes.linkType == 'I') {
      let url: string = '';
      if (!/^http[s]?:\/\//.test(this.selectedNotes.link)) {
        url += 'http://';
      }
      url += this.selectedNotes.link;
      window.open(url, '_blank');
    }

  }

  closeNotesDetails() {
    this.notesDetails = false;
    $('.portalwBlur').removeClass('ovrlay');
  }

  closeassetWorkDetailWindow($event) {
    $('.portalwBlur').removeClass('ovrlay');
    this.assetWorkDetailWindow = $event;
  }


  openServicingDetail(attr, service) {
    $('.portalwBlur').addClass('ovrlay');
    this.selectedAttribute = attr;
    this.selectedAttribute.job_Number = service.job_Number;
    //this.servicingDetailWindow = true; // single window of servicing detail
    this.serviceServicingDetailWindow = true;
  }

  closeServiceServicingDetailWindow($event) {
    $('.portalwBlur').removeClass('ovrlay');
    this.serviceServicingDetailWindow = $event;
  }

  closeServicingDetailWindow($event) {
    $('.portalwBlur').removeClass('ovrlay');
    this.servicingDetailWindow = $event;
  }


  openWag(attr) {
    this.selectedAttribute = attr;
    $('.portalwBlur').addClass('ovrlay');
    this.wagWindow = true;

  }

  closewagWindow($event) {
    $('.portalwBlur').removeClass('ovrlay');
    this.wagWindow = $event;
  }

  exportData(cl) {
    $("." + cl).trigger("click");
  }

  getAvailableAssetAttribute(availableAttrModel) {

    this.subs.add(
      this.assetAttributeService.getApexAssetAttributeAvailable(availableAttrModel).subscribe(
        data => {
          this.scrollLoad = true;
          if (data && data.isSuccess) {
            this.availableAttributes = data.data
          }
        }
      )
    )
  }

  selectAvailableAttr(availableAttr) {
    if (availableAttr != this.selectedAvailableAttr) {
      this.helper.setSelectedAvailableAttr(availableAttr);
      this.createAttributeForm.patchValue({
        quantity: (this.selectedAvailableAttr != undefined) ? this.selectedAvailableAttr.ataedefaultquantity : '',
        uom: (this.selectedAvailableAttr != undefined) ? this.selectedAvailableAttr.ataedefaultuom.trim() : '',
        generatorRepairs: (this.selectedAvailableAttr != undefined) ? (this.selectedAvailableAttr.elementLife != 0) ? true : false : false,
      })
    }
  }

  editAttrWindow($event) {
    this.editFromAssetAttr = $event;
    this.openCreateAttribute('edit', this.selectedAttribute);
  }

  openCreateAttribute(mode, assetObj = null) {
    this.subs.add(
      this.assetAttributeService.apexGetAssetManagementSecurity(this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            this.helper.setAssetManagementSecurity(data.data);
            this.createAttribute = true;
            this.availableAttributes = [];
            this.availableAttrModel = {
              'PageSize': 200,
              'CurrentPage': 0,
              'AssetId': '',
              'OrderBy': 'attcodE1',
              'OrderType': 'Ascending',//Ascending, Descending
              'SearchParam': ''
            }
            this.availableAttrModel.AssetId = this.assetId;
            if (mode == 'new' && this.checkAssetAttributeAccess('Attribute Add')) {
              if (!this.editFromAssetAttr) {
                $('.portalwBlur').addClass('ovrlay');
              }
              this.selectedAvailableAttr = [];
              this.getAvailableAssetAttribute(this.availableAttrModel);
              this.createAttrFormMode = true;
              this.createAttrSaveMsg = 'Attribute created successfully'
              this.createAttrTitle = 'Add new attribute'
              this.createAttrFormHeight = 'auto';
              this.calendarPosition = 'top';
              this.populateCreateAttrForm(this.selectedAvailableAttr, assetObj);
            } else if (mode == 'edit' && this.checkAssetAttributeAccess('Attribute Edit')) {
              if (!this.editFromAssetAttr) {
                $('.portalwBlur').addClass('ovrlay');
              }
              this.createAttrFormHeight = 'auto';
              this.createAttrFormMode = false;
              this.createAttrSaveMsg = 'Attribute updated successfully';
              this.createAttrTitle = 'Edit attribute - ' + assetObj.attribute;
              this.calendarPosition = 'bottom';
              setTimeout(function () {
                $('.crtAttFrm .k-content').css({ 'overflow': 'visible' });
              }, 800);
              this.populateCreateAttrForm(this.selectedAvailableAttr, assetObj);
            } else {
              this.alertService.error('User has no access to add or modify this attribute.')
            }

          }
        }
      )
    )



  }



  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid) {
          if (abstractControl.errors.hasOwnProperty('ngbDate')) {
            delete abstractControl.errors['ngbDate'];
          }
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


  get f() { return this.createAttributeForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.createAttributeForm);

    if (this.createAttributeForm.invalid) {
      return;
    }

    if (this.selectedAvailableAttr == undefined && this.createAttrFormMode) {
      this.alertService.error('Please select one record from table.')
      return;
    }

    let formObj: any = {};
    formObj.ASSID = encodeURIComponent(this.assetId);;
    formObj.InstallDate = this.dateFormate(this.createAttributeForm.value.installationDate);
    formObj.ServeyDate = this.dateFormate(this.createAttributeForm.value.surveyDate);
    formObj.ServiceDate = (this.createAttributeForm.value.serviceDate != "" && this.createAttributeForm.value.serviceDate != null) ? this.dateFormate(this.createAttributeForm.value.serviceDate) : "1753-01-01";
    formObj.UOM = this.createAttributeForm.value.uom != '' ? this.createAttributeForm.value.uom.trim() : '';
    formObj.Quantity = this.createAttributeForm.value.quantity;
    formObj.Source = this.createAttributeForm.value.dataSource;
    formObj.Status = (this.createAttributeForm.value.status) ? 'A' : 'I';
    formObj.UserId = this.currentUser.userId;

    if (this.createAttrFormMode) {
      formObj.PopulateRepaires = (this.createAttributeForm.value.generatorRepairs) ? 1 : 0;
      formObj.AttributeID = this.selectedAvailableAttr.ataid;
      this.assetAttributeService.apexAddAssetAttribute(formObj).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.resetKendoStates();
            this.closeCreateAttribute();
            this.getAssetAttribute(this.assetId);
            this.getAttributeFilterList(this.assetId);
            this.alertService.success(this.createAttrSaveMsg);
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    } else {
      formObj.AttributeID = this.selectedAttribute.ataId;
      this.assetAttributeService.apexEditAssetAttribute(formObj).subscribe(
        data => {
          this.alertService.success(this.createAttrSaveMsg);
          this.resetKendoStates()
          this.closeCreateAttribute();
          this.getAssetAttribute(this.assetId);
          this.getAttributeFilterList(this.assetId);
          this.alertService.success(this.createAttrSaveMsg);
        }
      )
    }
  }

  resetKendoStates() {
    this.state = {
      skip: 0,
      sort: [],
      group: [],
      filter: {
        logic: "or",
        filters: []
      }
    }
  }

  dateFormate(value) {
    return `${value.year}-${value.month}-${value.day}`
  }

  formErrorObject() {
    this.formErrors = {
      'installationDate': '',
      'quantity': '',
      'surveyDate': '',
      'uom': '',
      'serviceDate': '',
      'dataSource': '',
      'generatorRepairs': '',
      'status': ''
    }
  }

  populateCreateAttrForm(selectedAttr, astObj = null) {
    if (this.createAttrFormMode) {
      return this.createAttributeForm.patchValue({
        installationDate: '',
        quantity: (selectedAttr != undefined && selectedAttr.length != 0) ? selectedAttr.ataedefaultquantity : '',
        surveyDate: '',
        uom: (selectedAttr != undefined && selectedAttr.length != 0) ? selectedAttr.ataedefaultuom.trim() : '',
        serviceDate: '',
        dataSource: 'R',
        generatorRepairs: (selectedAttr != undefined && selectedAttr.length != 0) ? (selectedAttr.elementLife != 0) ? true : false : false,
        status: true,
      })
    } else if (this.createAttrFormMode == false && astObj != null) {
      this.selectedAttribute = astObj;
      return this.createAttributeForm.patchValue({
        installationDate: this.helper.ngbDatepickerFormat(astObj.installationDate),//astObj.installationDate,
        quantity: astObj.quantity,
        surveyDate: this.helper.ngbDatepickerFormat(astObj.surveyDate),//astObj.surveyDate,
        uom: astObj.uom.trim(),
        serviceDate: this.helper.ngbDatepickerFormat(astObj.lastServiceDate),//astObj.lastServiceDate,
        dataSource: (astObj.dataSource == 'Real') ? 'R' : (astObj.dataSource == 'Assumed') ? 'A' : (astObj.dataSource == 'Unknown') ? 'U' : 'U',
        status: (astObj.status == 'Active') ? true : false,
      })
    }

  }


  closeCreateAttribute() {
    if (!this.editFromAssetAttr) {
      $('.portalwBlur').removeClass('ovrlay');
    }
    this.editFromAssetAttr = false;
    this.createAttribute = false;
    this.submitted = false;
    this.availableAttributes = [];
  }

  public openConfirmationDialog(attrObj) {
    this.subs.add(
      this.assetAttributeService.apexGetAssetManagementSecurity(this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            this.helper.setAssetManagementSecurity(data.data);
            if (this.checkAssetAttributeAccess('Attribute Delete')) {
              $('.k-window').css({ 'z-index': 1000 });
              this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
                .then((confirmed) => (confirmed) ? this.deleteAttribute(attrObj) : console.log(confirmed))
                .catch(() => console.log('Attribute dismissed the dialog.'));
            } else {
              this.alertService.error('User has no access to delete attributes.')
            }
          }
        }
      )
    )

  }


  deleteAttribute(attrObj) {
    let obj: any = {};
    obj.ASSID = this.assetId;
    obj.AttributeID = attrObj.ataId;
    obj.UserId = this.currentUser.userId;

    $('.k-window').css({ 'z-index': 1000 });
    this.assetAttributeService.apexDeleteAssetAttribute(obj).subscribe(
      data => {
        this.getAssetAttribute(this.assetId);
        this.getAttributeFilterList(this.assetId);
        this.alertService.success('Attribute deleted successfully.')
        $('.k-window').css({ 'z-index': 10002 });
      }
    )

  }


  orderBy(orderBy) {
    this.availableAttributes = [];
    if (orderBy == this.availableAttrModel.OrderBy && this.availableAttrModel.OrderType == 'Ascending') {
      this.availableAttrModel.OrderType = 'Descending';
    } else {
      this.availableAttrModel.OrderType = 'Ascending';
    }
    this.availableAttrModel.OrderBy = orderBy;
    this.availableAttrModel.CurrentPage = 0;
    this.getAvailableAssetAttribute(this.availableAttrModel);
  }

  onScroll(event) {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    const offsetHeight = event.target.offsetHeight;
    let scrollPosition = scrollTop + offsetHeight + 10;
    const scrollTreshold = scrollHeight;
    const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)

    if (isIEOrEdge) {
      scrollPosition = scrollPosition + 10;
    }

    if (scrollPosition > scrollTreshold && this.scrollLoad) {
      this.scrollLoad = false;
      this.availableAttrModel.CurrentPage = this.availableAttrModel.CurrentPage + 1;
      this.subs.add(
        this.assetAttributeService.getApexAssetAttributeAvailable(this.availableAttrModel).subscribe(
          data => {
            if (data && data.isSuccess) {

              if (data.data.length != undefined && data.data.length > 0) {
                this.scrollLoad = true;
                let tempData = data.data;
                this.availableAttributes = this.availableAttributes.concat(tempData);
                this.availableAttributes.map(item => item.ataid)
                  .filter((value, index, self) => self.indexOf(value.ataid) === index);
              }
            }
          }
        )
      )
    }

  }

  searchAvailableAttr(val) {
    this.availableAttrModel.SearchParam = val;
    this.availableAttrModel.CurrentPage = 0;
    this.availableAttributes = [];
    this.subs.add(
      this.assetAttributeService.getApexAssetAttributeAvailable(this.availableAttrModel).pipe(debounceTime(1000)).subscribe(
        data => {
          this.scrollLoad = true;
          if (data && data.isSuccess) {
            this.availableAttributes = data.data
          }
        }
      )
    )
  }

}
