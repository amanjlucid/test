import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { AssetAttributeService, HelperService, AlertService, ConfirmationDialogService } from '../../_services'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { DataTablesModule } from 'angular-datatables';
import 'datatables.net';
import 'datatables.net-dt';
import 'datatables.net-buttons';
import { debounceTime } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-asset-attribute',
  templateUrl: './asset-attribute.component.html',
  styleUrls: ['./asset-attribute.component.css']
})

export class AssetAttributeComponent implements OnInit, OnDestroy, OnChanges {
  @Input() assetAttrWindow: boolean = false;
  @Input() editFromAssetAttr: boolean = false;
  @Input() fromAttrList: boolean = false;
  @Input() selectedAsset;
  @Input() selectedAttribute;
  @Output() closeAssetAttrWin = new EventEmitter<boolean>();
  @Output() closeRepairFromAttrWin = new EventEmitter<boolean>();
  @Output() editAttrWin = new EventEmitter<boolean>();
  public windowWidth = '800';
  public windowHeight = 'auto';
  public windowTop = '15';
  public windowLeft = 'auto';
  @Input() repairWin: boolean = false;
  wagWindow: boolean = false;
  public windowState = 'default'; //maximized
  dataTable: any;
  reapairTable: any;
  tableSetting = {
    paging: false,
    searching: true,
    info: false,
    colReorder: true,
    scrollY: '51vh',
    scrollX: '40vh',
  }
  assetRepairLists: any;
  selectedRepair: any;
  createAttributeRepair: boolean;
  availableRprTable: any;
  tableSettingRprForm = {
    paging: false,
    searching: true,
    info: false,
    colReorder: true,
    scrollY: '2vh',
    scrollX: '200vh',
    scrollCollapse: true,
  }
  submitted: boolean = false;
  validationMessage = {
    'quantity': {
      'required': 'Quantity is required.',
      'quanityInvalid': 'Quantity can only be 0 if a Spot Price is entered.',
      'recordedQty': 'Quantity cannot be greater than the Asset Attribute recorded Quantity.'

    },
    'uom': {
      'required': 'uom is required.',

    },
    'spotPrice': {
      'required': 'Spot Price is required.',
      'spotPriceInvalid': 'Spot Price should be numeric.',
      'spotPriceValueInvalid': 'Spot Price should not be greater than (9,2).',
      'invalidSpotPrice': 'Spot Price is required.'
    },
    'specificYear': {
      'required': 'Specific Year type is required.',
      'specYear': 'Specific Year must be greater than the Installation Date (Year).',
      'maxlength': 'Specific Year must be maximum 4 digit.',
      'maxSpecYear': 'Specific Year must be less than.'
    },

  };
  formErrors: any;
  createAttrRprSaveMsg: string = '';
  createAttrRprTitle: string = '';
  createAttrRprFormMode: boolean;
  createAttrRprFormHeight: any;
  createAttributeRprForm: FormGroup;
  availableAttrRpr: any;
  selectedAvailableRpr: any;
  currentUser: any;
  subs = new SubSink(); // to unsubscribe services
  assetManagement: any;

  constructor(
    private chRef: ChangeDetectorRef,
    private assetAttributeService: AssetAttributeService,
    public helperService: HelperService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if (changes['editFromAssetAttr'] != undefined && (changes['editFromAssetAttr'].previousValue === true && changes['editFromAssetAttr'].currentValue === false)) {
      $('.attrBgblur').removeClass('ovrlay');
    }


    if (changes['fromAttrList'] != undefined && changes['fromAttrList'].currentValue == true) {
      this.getrepair();
    }
  }


  ngOnInit() {
    
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.helperService.assetManagementSecurityObs.subscribe(data => this.assetManagement = data)

    this.checkAssetManagement();
    this.createAttributeRprForm = this.fb.group({
      quantity: [''],
      uom: [''],
      spotPrice: [''],
      specificYear: ['', [Validators.maxLength(4)]],

    })

    const quantityControl = this.createAttributeRprForm.get('quantity');
    const spotPriceControl = this.createAttributeRprForm.get('spotPrice');
    const specificYearControl = this.createAttributeRprForm.get('specificYear');

    this.subs.add(
      this.createAttributeRprForm.get('spotPrice').valueChanges.pipe(debounceTime(500)).subscribe(
        val => {
          if (val != "") {
            if (quantityControl.errors == null) {
              if (!isNaN(val) && quantityControl.value > 0) {
                //quantityControl.setErrors({ quanityInvalid: true });
              }
            }
            if (isNaN(val)) {
              spotPriceControl.setErrors({ spotPriceInvalid: true });
            } else {
              if (val != 0) {
                const checkDecimal = /^[-+]?[0-9]+\.[0-9]+$/;
                val = String(val);
                const checkDecimalVal = String(val).match(checkDecimal);
                if (checkDecimalVal != null && checkDecimalVal) {
                  const deciLength = val.split(".")[1].length || 0;
                  if (deciLength > 2 || isNaN(val)) {
                    spotPriceControl.setErrors({ spotPriceValueInvalid: true });
                  } else if (deciLength <= 2 && val.split(".")[0].length > 7) {
                    spotPriceControl.setErrors({ spotPriceValueInvalid: true });
                  }
                } else {
                  if (val.length > 7) {
                    spotPriceControl.setErrors({ spotPriceValueInvalid: true });
                  }
                }
              }
            }
          }

        }
      ),

      this.createAttributeRprForm.get('quantity').valueChanges.pipe(debounceTime(500)).subscribe(
        val => {
          if (val != "" && spotPriceControl.value == "" && val > this.selectedAttribute.quantity) {
            quantityControl.setErrors({ recordedQty: true });
          }

          if (spotPriceControl.value != "") {
            if (quantityControl.errors == null) {
              if (!isNaN(val) && quantityControl.value > 0) {
                //quantityControl.setErrors({ quanityInvalid: true });
              }
            }
          }
          
          if((val == 0 || val == "") && (spotPriceControl.value == 0 || spotPriceControl.value == '')){
            spotPriceControl.setErrors({ invalidSpotPrice: true });
          }
        }
      ),

      this.createAttributeRprForm.get('specificYear').valueChanges.pipe(debounceTime(500)).subscribe(
        val => {
          if (val != "") {
            const installYear = new Date(this.selectedAttribute.installationDate);
            if (val < installYear.getFullYear()) {
              specificYearControl.setErrors({ specYear: true });
            }
            if (val > this.selectedAttribute.systemMaxSpecYear) {
              this.validationMessage.specificYear.maxSpecYear = `Specific Year must be less than ${this.selectedAttribute.systemMaxSpecYear}`
              specificYearControl.setErrors({ maxSpecYear: true });
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
            this.helperService.setAssetManagementSecurity(data.data);
          }
        }
      )
    )
  }

  checkAssetAttributeAccess(param) {
    return this.helperService.checkAssetManagementAccess(this.assetManagement, param)
  }

  public closeAssetAttrWindow() {
    this.assetAttrWindow = false;
    this.closeAssetAttrWin.emit(this.assetAttrWindow)
  }

  editAttrWinOpen() {
    $('.attrBgblur').addClass('ovrlay');
    this.editAttrWin.emit(true)
  }

  // public sortChange(sort: SortDescriptor[]): void {
  //   this.sort = sort;
  //   this.gridData = {
  //     data: orderBy(this.products, this.sort),
  //     total: this.products.length
  //   };
  // }

  // public filterChange(filter: CompositeFilterDescriptor): void {
  //   this.filter = filter;
  //   this.gridData = process(filterBy(sampleProducts, filter), this.state);
  // }

  getrepair() {
    this.subs.add(
      this.assetAttributeService.getAssetAttributeRepair(this.selectedAsset.assetId, this.selectedAttribute.ataId).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.assetRepairLists = data.data;
            //console.log(this.assetRepairLists);
            if (this.reapairTable != undefined) {
              this.reapairTable.destroy();
            }
            this.rederTabel();
          }
        })
    );
  }

  rederTabel() {
    this.chRef.detectChanges();
    const table: any = $('.reapirTbl');
    this.reapairTable = table.DataTable(
      this.tableSetting
    );
  }

  rederTabelRpr() {
    this.chRef.detectChanges();
    if (this.availableRprTable != undefined) {
      this.availableRprTable.destroy();
    }
    this.chRef.detectChanges();
    const table: any = $('.attributeListRprTable');
    this.availableRprTable = table.DataTable(
      this.tableSettingRprForm
    );
  }

  selectRepairRow($event, repairObj) {
    this.selectedRepair = repairObj;
  }

  getApexAssetAttributeRepairAvailable() {
    this.subs.add(
      this.assetAttributeService.getApexAssetAttributeRepairAvailable(this.selectedAsset.assetId, this.selectedAttribute.ataId).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.availableAttrRpr = data.data;
            //console.log(this.availableAttrRpr);
            this.rederTabelRpr();
          }
        }
      )
    )
  }

  openCreateAttributeReapirs(mode, rprObj = null) {
    this.subs.add(
      this.assetAttributeService.apexGetAssetManagementSecurity(this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            this.helperService.setAssetManagementSecurity(data.data);
            this.createAttributeRepair = true;

            if (mode == 'new' && this.checkAssetAttributeAccess('Attribute Add')) {
              $('.attrRprBgblur').addClass('ovrlay');
              this.selectedAvailableRpr = [];
              this.createAttrRprFormMode = true;
              this.createAttrRprSaveMsg = 'Attribute Repair created successfully'
              this.createAttrRprTitle = 'Add new attribute repair'
              this.createAttrRprFormHeight = 'auto';
              this.getApexAssetAttributeRepairAvailable();
              this.populateCreateAttrForm();
            } else if (mode == 'edit' && this.checkAssetAttributeAccess('Attribute Edit')) {
              $('.attrRprBgblur').addClass('ovrlay');
              this.createAttrRprFormMode = false;
              this.createAttrRprSaveMsg = 'Attribute Repair updated successfully'
              this.createAttrRprTitle = 'Update attribute repair'
              this.createAttrRprFormHeight = 'auto';
              this.populateCreateAttrForm();
            } else {
              this.alertService.error('User has no access to add or modify this repair.')
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
              //console.log(this.formErrors[key]);
            }
          }
        }
      }
    })

  }


  selectAvailableRpr(selectedAvaiRpr) {
    if (selectedAvaiRpr != this.selectedAvailableRpr && selectedAvaiRpr.canAdd == 1) {
      this.selectedAvailableRpr = selectedAvaiRpr;
    } else if (selectedAvaiRpr != this.selectedAvailableRpr && selectedAvaiRpr.canAdd == 0) {
      this.selectedAvailableRpr = [];
    }
  }


  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error 
    this.logValidationErrors(this.createAttributeRprForm);
    if (this.createAttributeRprForm.invalid) {
      return;
    }
    if ((this.selectedAvailableRpr == undefined || this.selectedAvailableRpr.length == 0) && this.createAttrRprFormMode) {
      this.alertService.error('Please select one record from table.')
      return;
    }

    let formObj: any = {};
    formObj.ASSID = this.selectedAsset.assetId;
    formObj.AttributeID = this.selectedAttribute.ataId;

    formObj.Quantity = this.createAttributeRprForm.value.quantity;
    formObj.SpotPrice = this.createAttributeRprForm.value.spotPrice;
    formObj.UOM = this.createAttributeRprForm.value.uom;
    formObj.SpecificYear = this.createAttributeRprForm.value.specificYear;
    formObj.UserId = this.currentUser.userId;

    if (this.createAttrRprFormMode) {
      formObj.RepairYear = this.selectedAvailableRpr.reyrstartyear;
      this.assetAttributeService.apexAddAssetAttributeRepair(formObj).subscribe(
        data => {
          this.closeCreateAttributeRpr();
          this.getrepair();
        }
      )
    } else {
      formObj.RepairYear = this.selectedRepair.start_Year;
      this.assetAttributeService.apexEditAssetAttributeRepair(formObj).subscribe(
        data => {
          this.closeCreateAttributeRpr();
          this.getrepair();
        }
      )
    }
  }

  formErrorObject() {
    this.formErrors = {
      'quantity': '',
      'uom': '',
      'spotPrice': '',
      'specificYear': '',

    }
  }

  populateCreateAttrForm() {
    //console.log(this.selectedUser);
    return this.createAttributeRprForm.patchValue({
      quantity: (this.createAttrRprFormMode) ? this.selectedAttribute.quantity : this.selectedRepair.quantity,
      uom: (this.createAttrRprFormMode) ? this.selectedAttribute.uom.trim() : this.selectedRepair.uom.trim(),
      spotPrice: (this.createAttrRprFormMode) ? '' : this.selectedRepair.spot_Price,
      specificYear: (this.createAttrRprFormMode) ? '' : this.selectedRepair.specific_Year,

    })
  }

  closeCreateAttributeRpr() {
    this.createAttributeRepair = false;
    $('.attrRprBgblur').removeClass('ovrlay');
    this.submitted = false;
    this.availableAttrRpr = [];
  }


  public openConfirmationDialog(rprOb) {
    //this.deleteAttrWin = true;
    this.subs.add(
      this.assetAttributeService.apexGetAssetManagementSecurity(this.currentUser.userId).subscribe(
        data => {
          if (data.isSuccess) {
            this.helperService.setAssetManagementSecurity(data.data);
            if (this.checkAssetAttributeAccess('Attribute Delete')) {
              $('.k-window-wrapper').css({ 'z-index': 1000 });
              this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
                .then((confirmed) => (confirmed) ? this.deleteRepair(rprOb) : console.log(confirmed))
                .catch(() => console.log('Attribute dismissed the dialog.'));
            } else {
              this.alertService.error('User has no access to delete repairs.')
            }
          }
        })
    )

  }

  deleteRepair(rprOb) {
    let obj: any = {};
    obj.ASSID = this.selectedAsset.assetId;
    obj.AttributeID = rprOb.attribute_ID;
    obj.RepairYear = rprOb.start_Year;
    obj.UserId = this.currentUser.userId;

    this.assetAttributeService.apexDeleteAssetAttributeRepair(obj).subscribe(
      data => {
        this.getrepair();
        this.alertService.success('Attribute Repair deleted successfully.')
        $('.k-window-wrapper').css({ 'z-index': 10004 });
      }
    )

  }



  openRepair() {
    this.getrepair();
    this.repairWin = true;
    $('.attrBgblur').addClass('ovrlay');
  }

  closeRepairWindow() {
    this.repairWin = false;
    if (this.fromAttrList) {
      this.fromAttrList = false;
      this.assetAttrWindow = false
      this.closeRepairFromAttrWin.emit(this.fromAttrList);
    } else {
      $('.attrBgblur').removeClass('ovrlay');
    }


  }

  openWag() {
    $('.attrBgblur').addClass('ovrlay');
    this.wagWindow = true;
  }

  closewagWindow($event) {
    $('.attrBgblur').removeClass('ovrlay');
    this.wagWindow = $event;
  }

  printDiv() {
    this.windowState = 'maximized';
    $('.mainDiv, .buttonDiv, .k-header').hide();
    $('.k-content').addClass('mt-5');

    setTimeout(function () {
      window.print();
      setTimeout(function () {
        $('.mainDiv, .buttonDiv, .k-header').show();
        $('.k-content').removeClass('mt-5');

      }, 100);

    }, 100);

  }


}
