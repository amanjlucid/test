import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertService, LoaderService, PropertySecurityGroupService } from '../../../_services'
import { DataTablesModule } from 'angular-datatables';

import 'datatables.net';
import 'datatables.net-dt';
declare var $: any;

@Component({
  selector: 'app-property-security',
  templateUrl: './property-security.component.html',
  styleUrls: ['./property-security.component.css']
})
export class PropertySecurityComponent implements OnInit {

  @Input() propertySecurityWindow: boolean = false
  @Input() selectedGroup: any;
  @Output() closePropSecWin = new EventEmitter<boolean>();
  propSecTable: any;
  propSecGroups: any[];
  selectedPropGroup: any;
  submitted = false;
  dialogNewPropSec = false;
  hiearchyWindow = false;
  portals: any;
  selectedPortal: any;
  hiearchyTypeLists: any;
  selectedHiearchyType: any;
  newPropForm: FormGroup;
  tableSetting = {
    scrollY: '59vh',
    colReorder: true,
    scrollCollapse: true,
    paging: true
  }
  hierarchyLevels: any;
  selectedhierarchyLevel: any;
  printHiearchy: any;
  showAccess = false;
  currentUser;
  access;
  public windowWidth = '800';
  public windowHeight = 'auto';
  public windowTop = '170';
  public windowLeft = 'auto';


  constructor(
    private propSecGrpService: PropertySecurityGroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private formBuilder: FormBuilder

  ) { }


  ngOnInit() {
    this.getAllPropSecGroups();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.newPropForm = this.formBuilder.group({
      hiearchy: [''],
      hiearchyType: ['', Validators.required],
      hiearchyType1: [''],
      assetId: ['', Validators.required],
      assetId1: [''],
      portal: [''],
      access: [''],
    });

  }

  public closePropSecWindow() {
    this.propertySecurityWindow = false;
    this.closePropSecWin.emit(this.propertySecurityWindow)
  }


  public getAllPropSecGroups() {
    this.propSecGrpService.getAllPropSecGroups(this.selectedGroup.groupId).subscribe(
      (data) => {
        if (data && data.isSuccess) {
          this.propSecGroups = data.data;
          this.chRef.detectChanges();
          const grpTable: any = $('.propSecTable');
          this.propSecTable = grpTable.DataTable(this.tableSetting);
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      },
      (error) => {
        this.loaderService.hide();
        this.alertService.error(error);
      }
    )
  }

  public refreshTable() {
    if (this.propSecTable != undefined) {
      this.propSecTable.destroy();
    }
    this.getAllPropSecGroups();
  }



  public getPortalDropDownList() {
    this.propSecGrpService.getPortalDropDownList().subscribe(
      data => {
        if (data && data.isSuccess) {
          this.portals = data.data;
          if (this.portals) {
            this.selectedPortal = this.portals[0];
          }
        }
      }
    )
  }


  public getHierarchyTypeList() {
    this.propSecGrpService.getHierarchyTypeList().subscribe(
      data => {
        if (data && data.isSuccess) {
          this.hiearchyTypeLists = data.data;
          if (this.portals) {
            this.selectedHiearchyType = this.hiearchyTypeLists[0].hierarchyTypeCode;
            this.getHiearchyTree(this.selectedHiearchyType);
          }
        }
      }
    )
  }


  getHiearchyTree(hiearchyType = null) {
    if (this.selectedHiearchyType) {
      this.hierarchyLevels = [];
      this.propSecGrpService.getHierarchyAllLevel(this.selectedHiearchyType).subscribe(
        data => {
          this.hierarchyLevels = data;
        }
      )
    }
  }

  selectHiearchy(event: any, hiearchyLevel) {
    this.selectedhierarchyLevel = hiearchyLevel;
    let ancestorElm = this.findAncestor(event.target, 'tree');
    this.selectedhierarchyLevel.actualParentId = ancestorElm.className.replace('ng-star-inserted','').trim();
    
    // let path = event.path;
    // for (let i in path) {
    //   if (path[i].classList.contains('tree')) {
    //     let clStr = path[+i - 1].className.replace(" ng-star-inserted", "");
    //     this.selectedhierarchyLevel.actualParentId = clStr;
    //     break;
    //   }
    // }

  }

  findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.parentElement.classList.contains(cls));
    return el;
  }

  toggleClass(event, selectedPropGrp) {
    const target = event.target;
    const parent = target.parentNode;
    var elems = document.querySelectorAll("tr");
    [].forEach.call(elems, function (el) {
      el.classList.remove("selected");
    });
    parent.classList.toggle("selected");
    this.selectedPropGroup = selectedPropGrp;
  }


  setHiearchyValues() {
    if (this.selectedHiearchyType && this.selectedhierarchyLevel) {
      this.propSecGrpService.hierarchyStructureForAsset(this.selectedHiearchyType, this.selectedhierarchyLevel.assetId, this.selectedhierarchyLevel.actualParentId).subscribe(
        data => {
          this.printHiearchy = data;
          this.newPropForm.setValue({
            hiearchy: "as",
            hiearchyType: this.selectedHiearchyType,
            assetId: this.selectedhierarchyLevel.assetId,
            portal: this.selectedPortal,
            assetId1: "",
            hiearchyType1: "",
            access: ""
          });
          this.closeHiearchyWindow();
        }
      )
    }

  }

  checkAccess() {
    if (this.selectedPortal == "Asbestos Portal") {
      this.showAccess = true;
    } else {
      this.showAccess = false;
    }
  }


  get f() { return this.newPropForm.controls; } // access form controls


  onSubmit() {
    this.submitted = true;
    if (this.newPropForm.invalid) {
      return;
    }
    this.propSecGrpService.addPropertySecurity(this.selectedGroup, this.currentUser.userId, this.selectedHiearchyType, this.selectedhierarchyLevel.assetId, this.selectedPortal, this.access).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.closeNewPropSecPopup();
          this.refreshTable();
        }
      }
    )
  }


  private deleteSecPropGrp() {
    if (this.selectedPropGroup) {
      this.propSecGrpService.deletePropertySecurity(this.selectedGroup.groupId, this.selectedPropGroup.hierarchyTypeCode, this.selectedPropGroup.assetId, this.selectedPropGroup.accessArea).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.selectedPropGroup = [];
            this.refreshTable();
          }
        }
      );
    }
  }

  private clearPropSec() {
    this.resetPropSecForm();
  }

  // functions for opening popup and window
  public openNewPropSecPopup() {
    $('.psWindowBlur').addClass('ovrlay');
    this.getPortalDropDownList();
    this.dialogNewPropSec = true;
  }

  public closeNewPropSecPopup() {
    this.resetPropSecForm();
    $('.psWindowBlur').removeClass('ovrlay');
    this.dialogNewPropSec = false;
  }

  public openHiearchyWindow() {
    $('.portalwBlur').addClass('ovrlay');
    this.getHierarchyTypeList();
    this.hiearchyWindow = true;
  }

  public closeHiearchyWindow() {
    $('.portalwBlur').removeClass('ovrlay');
    this.hiearchyWindow = false;
  }

  resetPropSecForm() {
    this.submitted = false;
    this.printHiearchy = [];
    this.newPropForm.reset();
    this.showAccess = false;
  }


}
