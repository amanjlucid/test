import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GroupDescriptor, DataResult, process, State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridComponent, RowArgs } from '@progress/kendo-angular-grid';
import { AssetAttributeService, HelperService, LoaderService, AlertService, ConfirmationDialogService, SharedService } from '../../_services'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DateFormatPipe } from 'src/app/_pipes/date-format.pipe';
import { debounceTime, map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { DataTablesModule } from 'angular-datatables';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-buttons';


@Component({
  selector: 'app-asset-characteristics',
  templateUrl: './asset-characteristics.component.html',
  styleUrls: ['./asset-characteristics.component.css']
})

export class AssetCharacteristicsComponent implements OnInit, OnDestroy {

  @Input() assetId: string;
  @Input() selectedAsset;
  groups: GroupDescriptor[] = [];
  gridView: DataResult;
  filter: CompositeFilterDescriptor;
  multiple = false;
  allowUnsort = true;
  state: State = {
    skip: 0,
    group: [],
    sort: [{ field: 'characteristic', dir: 'asc' }],
    filter: {
      logic: "or",
      filters: []
    }
  }
  public mySelection: any[] = [];
  public selectedRows: any[] = [];
  public flatRows: any[] = [];
  currentUser;
  characteristicData;
  actualCharacteristicData;
  characteristicFilters;
  notesDetails: boolean = false;
  selectedNotes;
  notesTitle;
  notesImagePath: SafeResourceUrl;
  fileName: string = 'Asset-Characteristic.xlsx';
  tableSetting = {
    paging: false,
    searching: true,
    info: false,
    colReorder: true,
    scrollY: '5vh',
    order: [[2, "asc"]]
  }
  availableCharTable: any;
  createCar: boolean = false;
  createCarForm: FormGroup;
  validationMessage = {
    'charvalue': {
      'required': 'Value is required.',
      'maxlength': 'Text Type Characteristics should be limited to an entry of 50 characters.',
      'decimalInvalid': 'Value Type Characteristics can be integer or decimal up to two decimal places.',
      'invalideNumber': 'Number Type Characteristic should be an integer number only.',
      'invalidChar': '',

    }
  };
  formErrors: any;
  createCharSaveMsg: string = '';
  createCharTitle: string = '';
  createCharFormMode: boolean;
  createCharFormHeight: number;
  createCharFormWidth: number;
  submitted: boolean = false;
  availableChars: any;
  selectedAvailableChar: any;
  charcFixedTypeDropDown: any
  subs = new SubSink(); // to unsubscribe services
  characteristicCode;
  characteristicType = "";
  selectedChar: any;
  availableCharModel = {
    'PageSize': 200,
    'CurrentPage': 0,
    'AssetId': '',
    'OrderBy': 'characteristicCode',
    'OrderType': 'Ascending',//Ascending, Descending
    'SearchParam': ''
  }
  scrollLoad = true;
  assetManagement: any;
  message: string;

  constructor(
    private assetAttributeService: AssetAttributeService,
    private helper: HelperService,
    private _sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private loader: LoaderService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    //private data: SharedService
  ) { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // newMessage() {
  //   this.data.changeMessage("Hello from Sibling")
  // }

  ngOnInit() {
    //this.data.currentMessage.subscribe(message => this.message = message)

    this.helper.assetManagementSecurityObs.subscribe(data => this.assetManagement = data)
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getAssetCharacteristicFilters(this.assetId, this.currentUser.userId);
    this.getAssetCharacteristicList(this.assetId, this.currentUser.userId);
    this.checkAssetManagement();
    this.createCarForm = this.fb.group({
      charvalue: ['', Validators.required],

    })
    const charvalueControl = this.createCarForm.get('charvalue');

    this.subs.add(
      this.createCarForm.get('charvalue').valueChanges.pipe(debounceTime(500)).subscribe(
        val => {
          if (charvalueControl.errors == null) {
            if (this.createCharFormMode && this.selectedAvailableChar != undefined) {
              this.characteristicType = this.selectedAvailableChar.characteristicType
            } else if (this.createCharFormMode == false) {
              this.characteristicType = this.selectedChar.type.charAt(0);
              //console.log(this.characteristicType);
            }

            charvalueControl.setErrors(null);
            if (this.characteristicType == 'N') {
              // if (isNaN(val)) {
              //   charvalueControl.setErrors({ invalideNumber: true });
              // } 
              this.numericAndDecimalCharacteristicValidator(charvalueControl, val, 'N');
            } else if (this.characteristicType == 'V') {
              this.numericAndDecimalCharacteristicValidator(charvalueControl, val, 'V');
              // const checkDecimal = /^[-+]?[0-9]+\.[0-9]+$/;
              // const checkDecimalVal = val.match(checkDecimal);
              // if (isNaN(val)) {
              //   charvalueControl.setErrors({ decimalInvalid: true });
              // } else if (checkDecimalVal != null && checkDecimalVal) {
              //   const deciLength = val.split(".")[1].length || 0;
              //   if (deciLength > 2 || isNaN(val)) {
              //     charvalueControl.setErrors({ decimalInvalid: true });
              //   }
              // }

            } else if (this.characteristicType == 'T') {
              charvalueControl.setValidators([Validators.maxLength(50)])
            } else {
              charvalueControl.setErrors(null);
            }

          }
        }
      )
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

  checkAssetCharAccess(param) {
    return this.helper.checkAssetManagementAccess(this.assetManagement, param)
  }

  numericAndDecimalCharacteristicValidator(ctControl, val, type) {
    if (isNaN(val)) {
      ctControl.setErrors({ spotPriceInvalid: true });
    } else {
      if (val != 0) {
        const checkDecimal = /^[-+]?[0-9]+\.[0-9]+$/;
        val = String(val);
        const checkDecimalVal = val.match(checkDecimal);
        var fieldLen = 7;
        if (type == "N") {
          this.validationMessage.charvalue.invalidChar = `Numeric should be integer value and not longer than 7 digits.`;
          if (checkDecimalVal != null && checkDecimalVal) {
            ctControl.setErrors({ invalidChar: true });
          } else {
            if (val.length > fieldLen) {
              ctControl.setErrors({ invalidChar: true });
            }
          }
        } else if (type == "V") {
          fieldLen = 9;
          this.validationMessage.charvalue.invalidChar = `Value should not exceed numeric(11,2).`;
          if (checkDecimalVal != null && checkDecimalVal) {
            const deciLength = val.split(".")[1].length || 0;
            if (deciLength > 2 || isNaN(val)) {
              ctControl.setErrors({ invalidChar: true });
            } else if (deciLength <= 2 && val.split(".")[0].length > fieldLen) {
              ctControl.setErrors({ invalidChar: true });
            }
          } else {
            if (val.length > fieldLen) {
              ctControl.setErrors({ invalidChar: true });
            }
          }
        }
      }
    }
  }

  public mySelectionKey(context: RowArgs) {
    return context.index;
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.gridView = process(this.characteristicData, this.state);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.gridView = process(this.characteristicData, this.state);
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.state.group = groups;
    this.groups = groups;
    this.state.group = this.groups;
    this.gridView = process(this.characteristicData, this.state);//process(this.characteristicData, this.state);
  }

  private getAssetCharacteristicList(assetId: string, userId) {
    this.subs.add(
      this.assetAttributeService.getAssetCharacteristicList(assetId, userId).subscribe(
        data => {

          this.scrollLoad = true;
          this.loader.show()
          if (data.isSuccess && data) {
            let tempData = data.data;

            tempData.map(s => {
              s.dateModified = (s.dateModified != "") ? DateFormatPipe.prototype.transform(s.dateModified, 'DD-MMM-YYYY') : s.dateModified;
            });
            this.characteristicData = tempData;
            this.actualCharacteristicData = tempData;
            this.gridView = process(this.characteristicData, this.state)//process(this.characteristicData, this.state);
            this.loader.hide();
          } else {
            this.loader.hide();
          }
        }
      ))
  }

  private getAssetCharacteristicFilters(assetId: string, userId) {
    this.subs.add(this.assetAttributeService.getAssetCharacteristicFilters(assetId, userId).subscribe(
      data => {
        if (data.length > 0) {
          this.characteristicFilters = data;
        }
      }
    ))
  }

  filterAttributes(value) {
    let actualchar = this.actualCharacteristicData;
    if (value == 'ALL') {
      this.characteristicData = this.actualCharacteristicData;
    } else {
      this.characteristicData = actualchar.filter(c => c.filterValue == value);
    }
    this.gridView = process(this.characteristicData, this.state)
  }

  exportToExcel(grid: GridComponent, fileExt, rowSelection = null): void {
    if (fileExt == 'csv' || fileExt == 'txt' || fileExt == 'html' || fileExt == 'xlsx' || rowSelection != null) {
      this.fileName = 'Asset-Characteristic.' + fileExt;
      let ignore = ['notepadLists', 'filterValue'];
      let label = {
        'group': 'Group',
        'type': 'Type',
        'characteristic': 'Characteristics',
        'name': 'Name',
        'characteristicValue': 'Characteristic Value',
        'modifiedBy': 'Modified By',
        'dateModified': 'Modified Date'
      }

      this.flatRows = [];
      if (this.gridView.data.length != undefined) {
        var rows = this.checkNodes(this.gridView.data);
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
        // let selectedRows = rows.filter((v, k) => {
        //   return this.mySelection.includes(k)
        // });
        // this.selectedRows = selectedRows;
      } else {
        this.selectedRows = rows;
      }

      // if (fileExt == 'xlsx' && rowSelection != null) {
      if (fileExt == 'xlsx') {
        //this.helper.exportAsExcelFile(this.selectedRows, 'Asset-Characteristic', label)
        this.helper.exportToexcelWithAssetDetails(this.selectedRows, 'Asset-Characteristic', label)
      } else if (fileExt == 'html') {
        this.helper.exportAsHtmlFile(this.selectedRows, this.fileName, label)
      } else {
        this.helper.exportToCsv(this.fileName, this.selectedRows, ignore, label);
      }

    } else {
      grid.saveAsExcel();
    }

  }

  checkNodes(data) {
    for (let val of data) {
      if (val.hasOwnProperty("items")) {
        this.checkNodes(val.items)
      } else {
        this.flatRows.push(val);
      }
    }
    return this.flatRows;
  }

  openNotesDetails(notesDetails) {
    this.selectedNotes = notesDetails;
    if (this.selectedNotes.type == 'P') {
      $('.charBlur').addClass('ovrlay');
      this.notesTitle = "Attribute Image";
      this.assetAttributeService.getNotepadImage(this.selectedNotes.type, this.selectedNotes.ntpSequence, this.selectedNotes.ntpModifiedTime, this.selectedNotes.description).subscribe(
        data => {
          this.notesImagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
            'data:image/jpg;base64,' + data);
          this.notesDetails = true;
        }
      )
    } else if (this.selectedNotes.type == 'N') {
      $('.charBlur').addClass('ovrlay');
      this.notesTitle = "View Notepad Note...";
      this.notesDetails = true;
    } else if (this.selectedNotes.linkType == 'L') {
      let lnk = this.selectedNotes.link;
      let fileExt = lnk.substring(lnk.lastIndexOf(".") + 1)
      if (fileExt == 'txt') {

      } else if (fileExt == 'pdf') {
        this.assetAttributeService.getNotepadFile(this.selectedNotes.linkType, this.selectedNotes.ntpSequence, this.selectedNotes.modifiedDate, this.selectedNotes.text).subscribe(
          data => {
            const linkSource = 'data:application/pdf;base64,' + data;
            const downloadLink = document.createElement("a");
            const fileName = this.selectedNotes.fileName;
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
          }
        )
      }

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
    $('.charBlur').removeClass('ovrlay');
  }

  getApexAssetCharacteristicAvailable(availableCharModel) {
    this.subs.add(
      this.assetAttributeService.getApexAssetCharacteristicAvailable(availableCharModel).subscribe(
        data => {
          // console.log(data)
          this.scrollLoad = true;
          if (data && data.isSuccess) {
            this.availableChars = data.data;
            //this.rederTabel();
          }
        }
      )
    )
  }

  openCreateChar(mode, selectedCar = null) {
    this.subs.add(this.assetAttributeService.apexGetAssetManagementSecurity(this.currentUser.userId).subscribe(
      data => {
        if (data.isSuccess) {
          this.helper.setAssetManagementSecurity(data.data);
          this.createCar = true;
          this.availableCharModel = {
            'PageSize': 200,
            'CurrentPage': 0,
            'AssetId': '',
            'OrderBy': 'characteristicCode',
            'OrderType': 'Ascending',//Ascending, Descending
            'SearchParam': ''
          }
          this.availableCharModel.AssetId = this.assetId;


          if (mode == 'new' && this.checkAssetCharAccess('Characteristic Add')) {
            $('.charBlur').addClass('ovrlay');
            this.characteristicType = "";
            this.availableChars = [];
            this.selectedAvailableChar = [];
            this.getApexAssetCharacteristicAvailable(this.availableCharModel);
            this.createCharFormHeight = 765;
            this.createCharFormWidth = 900;
            this.createCharFormMode = true;
            this.createCharSaveMsg = 'Characteristic created successfully'
            this.createCharTitle = 'Add new Characteristic'
            this.createCarForm.patchValue({
              charvalue: '',
            })
          } else if (mode == 'edit' && this.checkAssetCharAccess('Characteristic Edit')) {
            $('.charBlur').addClass('ovrlay');
            this.selectedChar = selectedCar;
            // console.log(selectedCar);
            this.createCharFormHeight = 230;
            this.createCharFormWidth = 600;
            this.createCharFormMode = false;
            this.createCharSaveMsg = 'Characteristic updated successfully'
            this.createCharTitle = 'Update Characteristic'
            this.characteristicType = selectedCar.type.charAt(0);
            this.createCarForm.patchValue({
              charvalue: selectedCar.characteristicValue,
            })
            if (this.characteristicType == 'F') {
              this.subs.add(
                this.assetAttributeService.getFixedCharDropdownList(this.selectedChar.characteristic).subscribe(
                  data => {
                    if (data && data.isSuccess) {
                      this.charcFixedTypeDropDown = data.data;
                    }
                  }
                )
              )
            }
          } else {
            this.alertService.error('User has no access to add or modify this characteristic.')
          }
        }
      })
    )





  }

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

  get f() { return this.createCarForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.createCarForm);

    if (this.createCarForm.invalid) {
      return;
    }

    if (this.selectedAvailableChar == undefined && this.createCharFormMode) {
      this.alertService.error('Please select one record from table.')
      return;
    }

    let formObj: any = {};
    formObj.ASSID = encodeURIComponent(this.assetId);
    formObj.CharacteristicValue = this.createCarForm.value.charvalue;
    formObj.UserId = this.currentUser.userId;

    if (this.createCharFormMode) {
      formObj.CharacteristicCode = this.selectedAvailableChar.characteristicCode;
      this.subs.add(
        this.assetAttributeService.apexAddAssetCharacteristic(formObj).subscribe(
          data => {
            this.closeCreateChar();
            this.resetKendoStates();
            this.getAssetCharacteristicFilters(this.assetId, this.currentUser.userId);
            this.getAssetCharacteristicList(this.assetId, this.currentUser.userId);
            this.alertService.success(this.createCharSaveMsg);
          }
        )
      )
    } else {
      formObj.CharacteristicCode = this.selectedChar.characteristic;
      this.subs.add(
        this.assetAttributeService.apexEditAssetCharacteristic(formObj).subscribe(
          data => {
            this.closeCreateChar();
            this.resetKendoStates();
            this.getAssetCharacteristicFilters(this.assetId, this.currentUser.userId);
            this.getAssetCharacteristicList(this.assetId, this.currentUser.userId);
            this.alertService.success(this.createCharSaveMsg);
          }
        )
      )
    }

  }

  resetKendoStates() {
    this.state = {
      skip: 0,
      group: [],
      sort: [{ field: 'characteristic', dir: 'asc' }],
      filter: {
        logic: "or",
        filters: []
      }
    }
  }


  formErrorObject() {
    this.formErrors = {
      'charvalue': '',
    }
  }

  closeCreateChar() {
    this.createCar = false;
    $('.charBlur').removeClass('ovrlay');
    this.submitted = false;
    this.availableChars = [];
  }

  rederTabel() {
    this.chRef.detectChanges();
    if (this.availableCharTable != undefined) {
      this.availableCharTable.destroy();
    }
    this.chRef.detectChanges();
    const table: any = $('.availCharListTable');
    this.availableCharTable = table.DataTable(
      this.tableSetting
    );
  }

  selectAvailableChar(selectedObj) {
    if (selectedObj != this.selectedAvailableChar) {
      this.selectedAvailableChar = selectedObj;
      this.submitted = false;
      this.createCarForm.patchValue({
        charvalue: '',
      })
      this.characteristicType = this.selectedAvailableChar.characteristicType
      if (this.selectedAvailableChar.characteristicType == 'F') {
        this.subs.add(
          this.assetAttributeService.getFixedCharDropdownList(this.selectedAvailableChar.characteristicCode).subscribe(
            data => {
              if (data && data.isSuccess) {
                this.charcFixedTypeDropDown = data.data;
              }
            }
          )
        )
      }
      //console.log('available', this.selectedAvailableChar);
    }
  }

  public openConfirmationDialog(charObj) {
    this.subs.add(this.assetAttributeService.apexGetAssetManagementSecurity(this.currentUser.userId).subscribe(
      data => {
        if (data.isSuccess) {
          this.helper.setAssetManagementSecurity(data.data);
          if (this.checkAssetCharAccess('Characteristic Delete')) {
            $('.k-window-wrapper').css({ 'z-index': 1000 });
            this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
              .then((confirmed) => (confirmed) ? this.deleteChar(charObj) : console.log(confirmed))
              .catch(() => console.log('Attribute dismissed the dialog.'));

          } else {
            this.alertService.error('User has no access to delete characteristic.')
          }
        }
      })
    )


  }


  deleteChar(charObj) {
    let obj: any = {};
    obj.ASSID = this.assetId;
    obj.CharacteristicCode = charObj.characteristic;
    obj.UserId = this.currentUser.userId;

    $('.k-window-wrapper').css({ 'z-index': 1000 });
    this.assetAttributeService.apexDeleteAssetCharacteristic(obj).subscribe(
      data => {
        this.alertService.success('Characteristic deleted successfully.')
        this.getAssetCharacteristicFilters(this.assetId, this.currentUser.userId);
        this.getAssetCharacteristicList(this.assetId, this.currentUser.userId);
        $('.k-window-wrapper').css({ 'z-index': 10002 });
      }
    )
  }

  orderBy(orderBy) {
    this.availableChars = [];
    if (orderBy == this.availableCharModel.OrderBy && this.availableCharModel.OrderType == 'Ascending') {
      this.availableCharModel.OrderType = 'Descending';
    } else {
      this.availableCharModel.OrderType = 'Ascending';
    }
    this.availableCharModel.OrderBy = orderBy;
    this.availableCharModel.CurrentPage = 0;
    this.getApexAssetCharacteristicAvailable(this.availableCharModel);
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
      this.availableCharModel.CurrentPage = this.availableCharModel.CurrentPage + 1;
      this.subs.add(
        this.assetAttributeService.getApexAssetCharacteristicAvailable(this.availableCharModel).subscribe(
          data => {
            if (data && data.isSuccess) {
              if (data.data.length != undefined && data.data.length > 0) {
                this.scrollLoad = true;
                let tempData = data.data;
                this.availableChars = this.availableChars.concat(tempData);
                // console.log(this.availableChars);
                // this.availableChars.map(item => item.ataid)
                //   .filter((value, index, self) => self.indexOf(value.ataid) === index);

              }
            }
          }
        )
      )
    }

  }

  searchAvailableAttr(val) {
    this.availableCharModel.SearchParam = val;
    this.availableCharModel.CurrentPage = 0;
    this.availableChars = [];
    this.subs.add(
      this.assetAttributeService.getApexAssetCharacteristicAvailable(this.availableCharModel).pipe(debounceTime(2000)).subscribe(
        data => {
          this.scrollLoad = true;
          if (data && data.isSuccess) {
            this.availableChars = data.data
            //this.rederTabel();
          }
        }
      )
    )
  }


}
