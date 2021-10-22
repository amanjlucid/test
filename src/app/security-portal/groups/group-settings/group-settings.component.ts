import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, GroupService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-group-settings',
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GroupSettingsComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedGroup;
  @Output() closeGroupAssetDetailEvent = new EventEmitter<boolean>();
  @Output() refreshSecurityGroup = new EventEmitter<boolean>();
  group: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  submitted = false;
  groupForm: FormGroup;
  formErrors: any;
  validationMessage = {
    'showNoCharGroup': {
      'required': 'Description is required.',
    },

    'includeAllCharGroup': {
      'required': 'Status is required.',
    },

    'showNoElement': {
      'required': 'Group is required.',
    },

    'includeAllElements': {
      'required': 'Group is required.',
    },

    'includeAllPortalTabs': {
      'required': 'Group is required.',
    },

    'workOrderLevel': {
      'required': 'Group is required.',
    },
  }

  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private groupService: GroupService,
    private alertService: AlertService,
    private sharedServie: SharedService,
  ) { }

  ngOnInit(): void {
    this.groupForm = this.fb.group({
      showNoCharGroup: [''],
      includeAllCharGroup: [''],
      showNoElement: [''],
      includeAllElements: [''],
      includeAllPortalTabs: [''],
      workOrderLevel: [''],
    });

    const { groupID } = this.selectedGroup;

    this.subs.add(
      this.groupService.groupListByGroupId(groupID).subscribe(
        data => {
          if (data.isSuccess) {
            this.group = data.data
            const { showNoCharGroup, includeAllCharGroup, showNoElement, includeAllElements, includeAllPortalTabs, workOrderLevel } = this.group;

            this.groupForm.patchValue({
              showNoCharGroup: showNoCharGroup,
              includeAllCharGroup: includeAllCharGroup,
              showNoElement: showNoElement,
              includeAllElements: includeAllElements,
              includeAllPortalTabs: includeAllPortalTabs,
              workOrderLevel: workOrderLevel,
            })

            this.chRef.detectChanges()
          } else this.alertService.error(data.message)
        }, err => this.alertService.error(err)
      )
    )


    this.subs.add(
      this.sharedServie.saveSecurityGroupAssetDetailObs.subscribe(data => {
        if (data) this.save()
      })
    )


  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  formErrorObject() {
    this.formErrors = {
      'showNoCharGroup': '',
      'includeAllCharGroup': '',
      'showNoElement': '',
      'includeAllElements': '',
      'includeAllPortalTabs': '',
      'workOrderLevel': '',
    }
  }


  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        if (abstractControl && !abstractControl.valid && abstractControl.errors != null) {
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



  onSubmit() {
    this.sharedServie.emitSaveSecutiyGroupAssetDetail(true)
  }


  save() {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.groupForm);

    if (this.groupForm.invalid) {
      return;
    }

    let formRawVal = this.groupForm.getRawValue();

    const { groupName, groupDescription, status, canEditWorkOrderOnly, groupId } = this.group;

    const { showNoCharGroup, includeAllCharGroup, showNoElement, includeAllElements, includeAllPortalTabs, workOrderLevel } = formRawVal;

    let params: any = {}
    params.groupId = groupId;
    params.groupName = groupName;
    params.groupDescription = groupDescription;
    params.status = status;
    params.loggedInUserId = this.currentUser.userId;


    params.showNoCharGroup = showNoCharGroup;
    params.showNoElement = showNoElement;
    params.includeAllCharGroup = includeAllCharGroup
    params.includeAllElements = includeAllElements
    params.includeAllPortalTabs = includeAllPortalTabs
    params.workOrderLevel = workOrderLevel;
    params.canEditWorkOrderOnly = canEditWorkOrderOnly;

    this.groupService.updateSecurityGroup(params).subscribe(
      data => {
        if (data.isSuccess) {
          // this.alertService.success("Group settings updated successfully.")
          this.refreshSecurityGroup.emit(true)
        } else this.alertService.error(data.message)
      }, err => this.alertService.error(err)
    )


  }


  closeGroupAssetDetail() {
    this.closeGroupAssetDetailEvent.emit(true)
  }

}
