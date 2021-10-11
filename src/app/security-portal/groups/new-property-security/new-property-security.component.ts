import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { AlertService, GroupService, PropertySecurityGroupService } from '../../../_services'

@Component({
  selector: 'app-new-property-security',
  templateUrl: './new-property-security.component.html',
  styleUrls: ['./new-property-security.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class NewPropertySecurityComponent implements OnInit {
  subs = new SubSink();
  @Input() newPropsecurity: boolean = false;
  @Input() selectedGroup;
  @Output() closeNewPropertysecutiyEvent = new EventEmitter<boolean>();
  @Output() refreshPropertySecurity = new EventEmitter<boolean>();
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  title = '';
  submitted = false;
  group: any;
  portals: any;
  // selectedPortal: any
  hiearchyTypeLists: any;
  selectedHiearchyType: any;
  selectedhierarchyLevel: any;
  printHiearchy: any;
  hiearchyWindow = false;
  hierarchyLevels: any;

  newPropForm: FormGroup;
  showAccess = false;

  constructor(
    private propSecGrpService: PropertySecurityGroupService,
    private formBuilder: FormBuilder,
    private chRef: ChangeDetectorRef,
    private groupService: GroupService,
  ) { }

  ngOnInit(): void {
    this.title = `Add New Property Security '${this.selectedGroup.group}'`;

    this.newPropForm = this.formBuilder.group({
      hiearchyType: ['', Validators.required],
      assetId: ['', Validators.required],
      portal: [false, []],
      access: [''],
    });

    this.subs.add(
      this.groupService.groupListByGroupId(this.selectedGroup.groupID).subscribe(
        data => {
          if (data.isSuccess) {
            this.group = data.data
          }
        }
      )
    )

    // this.getPortalDropDownList();
    this.chRef.detectChanges()

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeNewPropertysecurity() {
    this.newPropsecurity = false;
    this.closeNewPropertysecutiyEvent.emit(false);
  }

  // getPortalDropDownList() {
  //   this.subs.add(
  //     this.propSecGrpService.getPortalDropDownList().subscribe(
  //       data => {
  //         console.log(data);
  //         if (data && data.isSuccess) {
  //           // this.portals = data.data;
  //           if (this.portals) {
  //             // this.newPropForm.patchValue({ portal: this.portals[0] })
  //             this.chRef.detectChanges()
  //             // this.selectedPortal = this.portals[0];
  //           }
  //         }
  //       }
  //     )
  //   )
  // }


  getHierarchyTypeList() {
    this.subs.add(
      this.propSecGrpService.getHierarchyTypeList().subscribe(
        data => {
          if (data && data.isSuccess) {
            this.hiearchyTypeLists = data.data;
            if (this.portals) {
              this.selectedHiearchyType = this.hiearchyTypeLists[0].hierarchyTypeCode;
              this.getHiearchyTree(this.selectedHiearchyType);
              this.chRef.detectChanges()
            }
          }
        }
      )
    )
  }


  getHiearchyTree(hiearchyType = null) {
    if (this.selectedHiearchyType) {
      this.hierarchyLevels = [];
      this.subs.add(
        this.propSecGrpService.getHierarchyAllLevel(this.selectedHiearchyType).subscribe(
          data => {
            this.hierarchyLevels = data;
            this.chRef.detectChanges()
          }
        )
      )
    }
  }

  selectHiearchy(event: any, hiearchyLevel) {
    this.selectedhierarchyLevel = hiearchyLevel;
    let ancestorElm = this.findAncestor(event.target, 'tree');
    this.selectedhierarchyLevel.actualParentId = ancestorElm.className.replace('ng-star-inserted', '').trim();

    let path = event.path;
    for (let i in path) {
      if (path[i].classList.contains('tree')) {
        let clStr = path[+i - 1].className.replace(" ng-star-inserted", "");
        this.selectedhierarchyLevel.actualParentId = clStr;
        this.chRef.detectChanges()
        break;
      }
    }

  }

  findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.parentElement.classList.contains(cls));
    return el;
  }


  public openHiearchyWindow() {
    $('.newSecurityBg').addClass('ovrlay');
    this.getHierarchyTypeList();
    this.hiearchyWindow = true;
  }

  public closeHiearchyWindow() {
    $('.newSecurityBg').removeClass('ovrlay');
    this.hiearchyWindow = false;
  }

  setHiearchyValues() {
    if (this.selectedHiearchyType && this.selectedhierarchyLevel) {
      this.subs.add(
        this.propSecGrpService.hierarchyStructureForAsset(this.selectedHiearchyType, this.selectedhierarchyLevel.assetId, this.selectedhierarchyLevel.actualParentId).subscribe(
          data => {
            this.printHiearchy = data;
            this.newPropForm.patchValue({
              hiearchyType: this.selectedHiearchyType,
              assetId: this.selectedhierarchyLevel.assetId,
            });

            this.closeHiearchyWindow();
            this.chRef.detectChanges()
          }
        )
      )
    }

  }


  clearPropSec() {
    this.resetPropSecForm();
  }

  resetPropSecForm() {
    this.submitted = false;
    this.printHiearchy = [];
    this.newPropForm.reset();
    this.showAccess = false;
  }

  checkAccess() {
    // if (this.selectedPortal == "Asbestos Portal") {
    //   this.showAccess = true;
    // } else {
    //   this.showAccess = false;
    // }
  }


  onSubmit() {
    this.submitted = true;
    if (this.newPropForm.invalid) {
      return;
    }

    let formRawVal = this.newPropForm.getRawValue();
    const { hiearchyType, assetId, access, portal } = formRawVal

    const selectedPortal = portal ? "Asbestos Lite" : 'Asset Portal';
    this.propSecGrpService.addPropertySecurity(this.group, this.currentUser.userId, hiearchyType, assetId, selectedPortal, access).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.closeNewPropertysecurity();
          this.refreshPropertySecurity.emit(true)
        }
      }
    )

  }







}
