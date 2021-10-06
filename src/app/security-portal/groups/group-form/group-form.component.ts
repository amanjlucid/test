import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, GroupService } from 'src/app/_services';

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GroupFormComponent implements OnInit {
  subs = new SubSink();
  @Input() isGroupForm: boolean = false;
  @Input() groupFormMode: 'new' | 'edit' | 'copy' = 'new';
  @Input() selectedGroup: any;
  @Output() closeGroupFormEvent = new EventEmitter<boolean>();
  @Output() reloadGroupEvent = new EventEmitter<boolean>();
  group: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  title = '';
  submitted = false;
  groupForm: FormGroup;
  formErrors: any;
  validationMessage = {
    'group': {
      'required': 'Group is required.',
    },

    'description': {
      'required': 'Description is required.',
    },

    'status': {
      'required': 'Status is required.',
    },
  }


  constructor(
    private chRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private groupService: GroupService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    if (this.groupFormMode == 'new') this.title = 'Add Security Group';
    if (this.groupFormMode == 'copy') this.title = 'Copy Security Group';
    if (this.groupFormMode == 'edit') this.title = `Edit Security Group '${this.selectedGroup.group}'`;

    this.groupForm = this.fb.group({
      group: ['', [Validators.required]],
      description: ['', [Validators.required]],
      status: [true, [Validators.required]],
    });


    if (this.groupFormMode != 'new') {
      const { group, description, status, groupID } = this.selectedGroup;
      this.subs.add(
        this.groupService.groupListByGroupId(groupID).subscribe(
          data => {
            if (data.isSuccess) {
              this.group = data.data
              this.groupForm.patchValue({
                group: this.groupFormMode == 'edit' ? group : '',
                description: description,
                status: status == 'A' ? true : false,
              })

              this.chRef.detectChanges()
            } else this.alertService.error(data.message)
          }, err => this.alertService.error(err)
        )
      )

    } else {
      this.chRef.detectChanges()
    }



  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  formErrorObject() {
    this.formErrors = {
      'group': '',
      'description': '',
      'status': '',
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
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.groupForm);

    if (this.groupForm.invalid) {
      return;
    }

    let formRawVal = this.groupForm.getRawValue();
    const { group, description, status } = formRawVal;

    let callApi: any;
    let message: string;
    let params: any = {}
    params.groupName = group;
    params.groupDescription = description;
    params.status = status;
    params.loggedInUserId = this.currentUser.userId;

    if (this.groupFormMode == 'new') {
      params.groupId = 0;
      params.showNoCharGroup = false;
      params.showNoElement = false;
      params.includeAllCharGroup = false
      params.includeAllElements = false
      params.includeAllPortalTabs = false
      params.workOrderLevel = false;
      params.canEditWorkOrderOnly = true;
      callApi = this.groupService.createSecurityGroup(params);
      message = "Record created succesfully."
    }

    if (this.groupFormMode == 'edit' || this.groupFormMode == 'copy') {
      const { groupId, showNoCharGroup, showNoElement, includeAllCharGroup, includeAllElements, includeAllPortalTabs, workOrderLevel, canEditWorkOrderOnly } = this.group;
      params.groupId = groupId;
      params.showNoCharGroup = showNoCharGroup;
      params.showNoElement = showNoElement;
      params.includeAllCharGroup = includeAllCharGroup
      params.includeAllElements = includeAllElements
      params.includeAllPortalTabs = includeAllPortalTabs
      params.workOrderLevel = workOrderLevel;
      params.canEditWorkOrderOnly = canEditWorkOrderOnly;
      callApi = this.groupService.updateSecurityGroup(params);
      message = "Record updated succesfully."
    }

    let group_id = params.groupId;
    if (this.groupFormMode == 'copy') {
      group_id = 0;
      callApi = this.groupService.copySecurityGroup(params);
      message = "Record copied succesfully."
    }

    this.groupService.validateGroupName(params.groupName, group_id).subscribe(
      data => {
        if (data.isSuccess) {
          callApi.subscribe(
            resp => {
              if (resp.isSuccess) {
                this.alertService.success(message);
                this.closeGroupForm();
                this.reloadGroupEvent.emit(true);
              } else this.alertService.error(data.message);
            }, err => this.alertService.error(err)
          )
        } else this.alertService.error(data.message)
      }
    )


  }



  closeGroupForm() {
    this.isGroupForm = false;
    this.closeGroupFormEvent.emit(false);
  }


}
