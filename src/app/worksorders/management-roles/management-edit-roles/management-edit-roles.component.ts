import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService, ConfirmationDialogService } from '../../../_services';
import { WopmUserrole } from '../../../_models'
declare var $: any;
import { SubSink } from 'subsink';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-management-edit-roles',
  templateUrl: './management-edit-roles.component.html',
  styleUrls: ['./management-edit-roles.component.css']
})
export class ManagementEditRolesComponent implements OnInit {

  subs = new SubSink();
  userRoleForm: FormGroup;
  @Input() editFormWindow: boolean = false
  @Input() selectedUserRole: WopmUserrole
  @Input() selectedWorksOrder: any
  @Input() editFormType: any
  @Output() closeEditFormWindow = new EventEmitter<boolean>();
  originalUserRole: string;
  wopmUserRoleModel: WopmUserrole
  loading = false;
  submitted = false;
  public windowTitle: string;
  securityUsers: any[];
  userRoleList: any[];
  woseq: number;
  currentUser;
  formErrors: any;
  public disableUser: boolean = false;
  public roleTypeSelected: boolean = false;
  userRoles: any[];
  public userRolesDistinct: any[];
  searchName: string = ""
  roleType: string = ""
  searchTerm$ = new Subject<string>();
  secUserNameID: string = ""

  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private confirmationDialogService: ConfirmationDialogService,
    private alertService: AlertService
  ) { }


  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userRoleForm = this.fb.group({
      userRoleType: ['', Validators.required],
      userRole: ['', Validators.required],
      securityUser: ['', Validators.required],
     })

     let WOName = this.selectedWorksOrder.name != undefined? this.selectedWorksOrder.name:this.selectedWorksOrder.woname;

    this.woseq = this.selectedWorksOrder.wosequence;
    if (this.editFormType == "new") {
      this.disableUser = true;
      this.windowTitle = 'New User Role: ' +this.selectedWorksOrder.wosequence + ' - ' +  WOName ;
    } else if (this.editFormType == "edit") {
      this.disableUser = true;
      this.secUserNameID = this.selectedUserRole.woUserName + ' (' + this.selectedUserRole.woUserID  + ')'
      this.windowTitle = 'Edit User Role: ' +this.selectedWorksOrder.wosequence + ' - ' +  WOName ;
      this.populateTemplate(this.selectedUserRole);

    }

    this.subs.add(
      this.searchTerm$
        .pipe(
          debounceTime(1000),
        ).subscribe((searchTerm) => {
          this.searchName = searchTerm;
          this.roleChanged(searchTerm);
        })
    )
    this.loadUserRoles();

  }

  clearForm(){
    this.f.userRole.setValue('');
    if(this.editFormType == 'new'){this.f.securityUser.setValue('');}
  }

  loadUserRoles(){
    this.userRolesDistinct = []
    this.wopmConfigurationService.getEditRolesUserRolesList(this.selectedUserRole.woUserID)
      .subscribe(
        data => {
          if (data.isSuccess){
           this.userRoles = data.data;
            this.userRoles.forEach((element) => {
              if (!this.userRolesDistinct.includes(element.jobRoleType)) {
                this.userRolesDistinct.push(element.jobRoleType);
              }
            });
            if(this.editFormType == 'edit'){this.roleTypeChanged(this.selectedUserRole.jobRoleType)}
            this.editFormWindow = true;
            } else {
              this.alertService.error(data.message);
            }
          })

  }

  roleTypeChanged(value){
    this.userRoleList =  []
    this.securityUsers = []
    this.clearForm()
    this.formErrorObject()
    this.disableUser = true;
    if(value != undefined && value != '')
    {
      this.roleType = value;
      this.roleTypeSelected = true;
      this.userRoles.forEach((element) => {
        let v = element.jobRoleType
        if (v == value) {
          this.userRoleList.push(element.jobRole);
        }
      });
    }
    if(this.editFormType == 'edit')
    {
      this.userRoleForm.controls.userRole.setValue(this.selectedUserRole.jobRole);
    }

  }

  roleChanged(value){
    this.formErrorObject()
    if(value != undefined && value != '' && this.editFormType == 'new')
    {
      //go get the security users
      this.wopmConfigurationService.getEditRolesSecurityUsersList(this.woseq, this.roleType, this.searchName, (value == 'Administrator'))
      .subscribe(
        data => {
          if (data.isSuccess){
            this.securityUsers = data.data;
            this.disableUser = false;
            } else {
              this.alertService.error(data.message);
            }
        });
    }
  }

  searchUsers($event){
    this.searchTerm$.next($event.target.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  populateTemplate(userrole: WopmUserrole = null) {

    return this.userRoleForm.patchValue({
      userRoleType: userrole.jobRoleType ,
      userRole: userrole.jobRole,
      securityUser:  userrole.woUserID,
    })

  }

  logValidationErrors(group: FormGroup): void {

    if(this.f.userRoleType.value == undefined || this.f.userRoleType.value == "")
    {
      this.formErrors.userRoleType = 'Please select a role type.';
    }
    if(this.f.userRole.value == undefined || this.f.userRole.value == "")
    {
      this.formErrors.userRole = 'Please enter a user role.';
    }
    if(this.f.securityUser.value == undefined || this.f.securityUser.value == "")
    {
      this.formErrors.securityUser = 'Please select a security user.';
    }
   }

  formErrorObject() {
    this.formErrors = {
      'userRoleType': '',
      'userRole': '',
      'securityUser': ''
    }
  }

  get f() { return this.userRoleForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.formErrorObject(); // empty form error
    this.logValidationErrors(this.userRoleForm);

    if (this.userRoleForm.invalid) {
      return;
    }

    let formRawVal = this.userRoleForm.getRawValue();
   // extra validation around values here

    this.wopmUserRoleModel = new WopmUserrole();
    if (this.editFormType == "new") {
      this.wopmUserRoleModel.newRecord = true;
    } else {
      this.wopmUserRoleModel.newRecord = false;
    }
    this.wopmUserRoleModel.worksOrderSeq = this.selectedWorksOrder.wosequence
    this.wopmUserRoleModel.jobRoleType = formRawVal.userRoleType;
    this.wopmUserRoleModel.jobRole = formRawVal.userRole;
    this.wopmUserRoleModel.woUserID  = formRawVal.securityUser;
    this.wopmUserRoleModel.userID = this.currentUser.userId;
    this.wopmUserRoleModel.checkProcess = 'C';

    this.wopmConfigurationService.updateUserRole(this.wopmUserRoleModel)
    .subscribe(
      data => {
        if (data.isSuccess) {
          if (data.data == 'S'){
            this.alertService.success(data.message);
            this.closeEditFormWin()
          }else{
            this.openConfirmationDialog(data.message);
          }
        } else {
          this.loading = false;
          this.alertService.error(data.message);
        }
      },
      error => {
        this.alertService.error(error);
        this.loading = false;
      });
    }

    public openConfirmationDialog(message) {
      this.confirmationDialogService.confirm('Please confirm..', message)
        .then((confirmed) => (confirmed) ? this.completeUpdate() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
      $('.k-window').css({ 'z-index': 1000 });
    }

    completeUpdate() {
      //nothing to do now
    }


  closeEditFormWin() {
    this.editFormWindow = false;
    this.closeEditFormWindow.emit(this.editFormWindow)
  }


}
