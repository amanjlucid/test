import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Group } from '../../_models'
import { GroupService, AlertService, LoaderService, ConfirmationDialogService, HelperService } from '../../_services'
import { DataTablesModule } from 'angular-datatables';
import 'datatables.net';
import 'datatables.net-dt';
declare var $: any;

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
})

export class GroupsComponent implements OnInit {
  groupDataTable: any;
  securityFormType: string;
  submitted = false;
  currentUser: any;
  public groups: Group[];
  public selectedGroup: Group;
  public windowTitle: string;
  public dialogOpened = false; // add, edit, copy user group form
  public charGrpWindow = false;
  public elmGrpWindow = false
  public attrGrpWindow = false;
  public portalGrpWindow = false;
  public functionSecurityWindow = false;
  public propertySecurityWindow = false;
  public openReports = false;
  public reportingAction = "";

  public windowWidth = 'auto';
  public windowHeight = 'auto';
  public windowTop = '45';
  public windowLeft = 'auto';

  public groupTableSetting = {
    scrollY: '60vh',
    scrollX: '100vh',
    searching: true,
    scrollCollapse: false,
    paging: true,
    colReorder: true,
    columnDefs: [
      { "searchable": false, "targets": 0 },
      { 'orderData': [16], 'targets': [17] },
      { 'orderData': [19], 'targets': [20] },
      {
        'targets': [16],
        'visible': false,
        'searchable': false
      },
      {
        'targets': [19],
        'visible': false,
        'searchable': false
      },
    ],
  }

  constructor(
    private groupService: GroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private helper: HelperService
  ) { }

  ngOnInit() {
    //update notification on top
    this.helper.updateNotificationOnTop();
    this.getAllGroups();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnDestroy() {
    $('.bgblur').removeClass('ovrlay');
  }

  getAllGroups() {
    this.groupService.getAllGroups().subscribe(
      (data) => {
        if (data && data.isSuccess) {
          this.groups = data.data;
          if (this.groups != undefined) {
            this.selectedGroup = this.groups[0];

          }
          this.chRef.detectChanges();
          const grpTable: any = $('.grpTable');
          this.groupDataTable = grpTable.DataTable(this.groupTableSetting);
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


  public openPopup(action, groupData?: Group) {
    this.securityFormType = action;
    if (action == 'edit') {
      this.windowTitle = `Edit Security Group '${groupData.groupName}'`;
      this.selectedGroup = groupData;
    } else if (action == 'new') {
      this.windowTitle = `Add Security Group`;
      this.newSecurityForm();
    } else if (action == 'copy') {
      this.windowTitle = `Copy Security Group`;
      this.selectedGroup = groupData;
      this.selectedGroup.groupName = "";
    }
    this.dialogOpened = true;
    $('.bgblur').addClass('ovrlay');


  }


  onSubmit() {
    this.submitted = true;
    this.selectedGroup.loggedInUserId = this.currentUser.userId;
    let callApi: any;
    let message = "";
    let groupId = this.selectedGroup.groupId;
    if (this.securityFormType == "copy") {
      groupId = 0;
    }
    this.groupService.validateGroupName(this.selectedGroup.groupName, groupId).subscribe(
      data => {
        if (data.isSuccess) {
          if (this.securityFormType == "edit") {
            callApi = this.groupService.updateSecurityGroup(this.selectedGroup);
            message = "Record updated succesfully."
          } else if (this.securityFormType == "new") {
            callApi = this.groupService.createSecurityGroup(this.selectedGroup);
            message = "Record created succesfully."
          } else if (this.securityFormType == "copy") {
            callApi = this.groupService.copySecurityGroup(this.selectedGroup);
            message = "Record copied succesfully."
          }

          callApi.subscribe(
            data => {
              this.closePopup();
              this.alertService.success(message);
            },
            (error) => {
              this.loaderService.hide();
              this.alertService.error(error);
            }
          )
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


  public newSecurityForm() {
    this.selectedGroup = {
      groupId: 0,
      groupCode: null,
      groupName: null,
      groupDescription: null,
      showNoCharGroup: false,
      showNoElement: false,
      includeAllCharGroup: false,
      includeAllElements: false,
      includeAllPortalTabs: false,
      workOrderLevel: false,
      status: true,
      canEditWorkOrderOnly: true
    };
  }


  public closePopup() {
    this.refreshGroupTable();
    this.dialogOpened = false;
    $('.bgblur').removeClass('ovrlay');
  }


  public refreshGroupTable(flag = null) {
    let searchVal = $('[type=search]').val();

    this.groupService.getAllGroups().subscribe(
      dataGrp => {
        if (dataGrp && dataGrp.isSuccess) {
          if (this.submitted && (this.securityFormType == "new" || this.securityFormType == "copy" || this.securityFormType == "edit")) {
            this.groupDataTable.destroy();
            this.groups = dataGrp.data;
            this.chRef.detectChanges();
            const table: any = $('.grpTable');
            this.groupDataTable = table.DataTable(this.groupTableSetting);
            this.submitted = false;
            if (searchVal != "" && searchVal != undefined && this.securityFormType != "new") {
              this.groupDataTable.search(searchVal).draw();
            }

            let comp = this;
            $('.searchDiv input').each(function () {
              if ($(this).val() != "") {
                let values = $(this).val();
                let colNumber = $(this).attr('data-col');
                //console.log(colNumber);
                comp.groupDataTable
                  .columns(colNumber)
                  .search(values).draw();
              }

            });

          } else {
            if (dataGrp.data != undefined && dataGrp.data && this.selectedGroup.groupId != undefined && flag != undefined || flag == "delete") {
              this.groupDataTable.destroy();
              this.groups = dataGrp.data;
              this.chRef.detectChanges();
              const table: any = $('.grpTable');
              this.groupDataTable = table.DataTable(this.groupTableSetting);
            } else if (!this.submitted && (this.securityFormType == "edit" || this.securityFormType == "copy")) {
              Object.keys(dataGrp.data).forEach(key => {
                if (dataGrp.data[key].groupId === this.selectedGroup.groupId) {
                  this.selectedGroup.groupName = dataGrp.data[key].groupName,
                    this.selectedGroup.groupDescription = dataGrp.data[key].groupDescription,
                    this.selectedGroup.showNoCharGroup = dataGrp.data[key].showNoCharGroup,
                    this.selectedGroup.showNoElement = dataGrp.data[key].showNoElement,
                    this.selectedGroup.includeAllCharGroup = dataGrp.data[key].includeAllCharGroup,
                    this.selectedGroup.includeAllElements = dataGrp.data[key].includeAllElements,
                    this.selectedGroup.includeAllPortalTabs = dataGrp.data[key].includeAllPortalTabs,
                    this.selectedGroup.workOrderLevel = dataGrp.data[key].workOrderLevel,
                    this.selectedGroup.status = dataGrp.data[key].status,
                    this.selectedGroup.canEditWorkOrderOnly = dataGrp.data[key].canEditWorkOrderOnly
                  return;
                }
              });
            }
          }
        }
      }
    )
  }


  public openConfirmationDialog(group: Group) {
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteSecurityGroup(group) : console.log(confirmed))
      .catch(() => console.log('User dismissed the dialog.'));
  }

  private deleteSecurityGroup(group: Group) {
    this.groupService.deleteSecurityGroup(group.groupId).subscribe(
      delData => {
        this.submitted = true;
        this.refreshGroupTable('delete');
        this.alertService.success("Record deleted successfully.");
      }
    )
  }


  toggleClass(group) {
    this.selectedGroup = group;
  }


  // functions for opening popup and window
  openCharGrpWin(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.charGrpWindow = true;
  }

  closeCharGrpWin($event) {
    this.charGrpWindow = $event;
    $('.bgblur').removeClass('ovrlay');
  }

  openElmGrpWin(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.elmGrpWindow = true;
  }

  closeElmGrpWin($event) {
    this.elmGrpWindow = $event;
    $('.bgblur').removeClass('ovrlay');
  }


  openAttrGrpWin(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.attrGrpWindow = true;
  }

  closeAttrGrpWin($event) {
    this.attrGrpWindow = $event;
    $('.bgblur').removeClass('ovrlay');
  }


  openPortalGrpWin(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.portalGrpWindow = true;
  }

  closePortalGrpWin($event) {
    $('.bgblur').removeClass('ovrlay');
    this.portalGrpWindow = $event;
  }


  openFunctionSecWindow(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.functionSecurityWindow = true;

  }

  closeFuncitonSecWin($event) {
    this.functionSecurityWindow = $event;
    $('.bgblur').removeClass('ovrlay');

  }


  openPropSecWindow(group) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.propertySecurityWindow = true;
  }


  closePropSecWin($event) {
    this.propertySecurityWindow = $event;
    $('.bgblur').removeClass('ovrlay');

  }

  public openReport(group, action) {
    $('.bgblur').addClass('ovrlay');
    this.selectedGroup = group;
    this.reportingAction = action;
    this.openReports = true;
  }

  public closeReportingWin() {
    $('.bgblur').removeClass('ovrlay');
    this.openReports = false;

  }

  openSearchBar() {
    var scrollTop = $('.layout-container').height();
    $('.notification-container').show();
    $('.notification-container').css('height', scrollTop);
    if ($('.notification-container').hasClass('dismiss')) {
      $('.notification-container').removeClass('dismiss').addClass('selectedcs').show();
    }

  }

  closeSearchBar() {
    if ($('.notification-container').hasClass('selectedcs')) {
      $('.notification-container').removeClass('selectedcs').addClass('dismiss');
      $('.notification-container').animate({ width: 'toggle' });
    }
  }

  searchInGroupTable(event: any) {
    let values = event.target.value;
    let colNumber = event.target.getAttribute("data-col");
    this.groupDataTable
      .columns(colNumber)
      .search(values).draw();

  };

  clearGroupSearchForm() {
    $("#groupSearch").trigger("reset");
    this.groupDataTable.search('').columns().search('').draw();
  }



}
