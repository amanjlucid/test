import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, AlertService, LoaderService, ConfirmationDialogService, HelperService } from '../../_services'
import { DataTablesModule } from 'angular-datatables';
import { User, UserGroup } from '../../_models'
import 'datatables.net';
import 'datatables.net-dt';

import 'datatables.net-buttons';

declare var $: any;


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})

export class UsersComponent implements OnInit {

  public windowOpened = false;
  public selectedUser: User;
  public users: User;
  public userGroups: UserGroup[];
  public selectedGroup: UserGroup;
  public actualGroups: UserGroup[];
  dataTable: any;
  usersTable: any;
  public userFormType: any = "new";

  public userFormWindow = false;
  public windowWidth = 'auto';
  public windowHeight = 'auto';
  public windowTop = '30';
  public windowLeft = 'auto';
  userTableSetting = {
    scrollY: '59vh',
    scrollX: '200vh',
    scrollCollapse: true,

    paging: true,
    colReorder: true,
    "aoColumnDefs": [
      { "bSearchable": false, "aTargets": [0] }
    ],
    dom: 'lBfrtip',
    buttons: [{
      extend: 'excel',
      title: 'User list',
      exportOptions: {
        columns: 'th:not(:first-child)'
      }
    }]
  }

  assignUserTblSetting = {
    scrollY: '56vh',
    sScrollX: "100%",
    colReorder: true,
    scrollCollapse: true,
    paging: true,
    columnDefs: [
      { 'orderData': [5], 'targets': [4] },
      {
        'targets': [4],
        'visible': false,
        'searchable': false
      }
    ],
  }



  constructor(
    private router: Router,
    private userService: UserService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private helper: HelperService
  ) { }


  ngOnInit() {
    //update notification on top
    this.helper.updateNotificationOnTop();
    this.getUserList();

  }

  ngOnDestroy() {
    $('.bgblur').removeClass('ovrlay');
  }


  getUserList() {
    let searchVal = $('[type=search]').val();
    this.userService.getAllUsers().subscribe(
      data => {
        if (data && data.isSuccess) {
          this.users = data.data;
          if (this.usersTable != undefined) {
            this.usersTable.destroy();
          }
          this.chRef.detectChanges();
          const table: any = $('.usersTable');
          this.usersTable = table.DataTable(
            this.userTableSetting
          );
          if (this.users != undefined) {
            this.selectedUser = this.users[0];
          }
          if (searchVal != "" && searchVal != undefined && this.userFormType != "new") {
            this.usersTable.search(searchVal).draw();
          }
          //$('.dataTables_filter').hide();
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      },
      error => {
        this.loaderService.hide();
        this.alertService.error(error);
      });
  }


  getAssignedUserGroup(userId: string) {
    this.userService.getUserGroups(userId).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.userGroups = data.data;
          this.actualGroups = data.data;
          this.windowOpened = true;
          this.chRef.detectChanges();
          const table: any = $('.innerTable1');
          this.dataTable = table.DataTable(
            this.assignUserTblSetting
          );
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      },
      error => {
        this.loaderService.hide();
        this.alertService.error(error);
      })
  }


  toggleClass(event: any, user) {
    this.selectedUser = user;
    const target = event.target;
    const parent = target.parentNode;
    var elems = document.querySelectorAll("tr");
    [].forEach.call(elems, function (el) {
      el.classList.remove("selected");
    });
    parent.classList.toggle("selected");
  }

  toggleUserClass(event: any, user) {
    this.selectedUser = user;
    const target = event.target;
    const parent = target.parentNode.parentNode.parentNode;
    var elems = document.querySelectorAll("tr");
    [].forEach.call(elems, function (el) {
      el.classList.remove("selected");
    });
    parent.classList.toggle("selected");
  }

  includeOnlyGroup(event: any) {
    this.userService.getUserGroups(this.selectedUser.userId.toString()).subscribe(
      datanew => {
        if (datanew && datanew.isSuccess) {
          this.userGroups = datanew.data;
          this.actualGroups = datanew.data;
          this.dataTable.destroy();

          if (event.target.checked) {
            let newgrp: UserGroup[];

            newgrp = this.userGroups.filter(gr => gr.isSelected == true);
            this.userGroups = newgrp;
          } else {
            this.userGroups = this.actualGroups;
          }

          // reinitialize datatable
          this.chRef.detectChanges();
          const table: any = $('.innerTable1');
          this.dataTable = table.DataTable(this.assignUserTblSetting);
        }
      })

  }


  assigneGroup(event: any, selectedUser, groupId) {
    let isSelected = event.target.checked;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userService.assigneGroup(isSelected, selectedUser, groupId, currentUser.userId).subscribe(
      data => {
        if (data && data.isSuccess) {
          //console.log(data);
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      },
      error => {
        this.loaderService.hide();
        this.alertService.error(error);
      }
    );
  }


  public openConfirmationDialog(user: User) {
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
      .then((confirmed) => (confirmed) ? this.deleteUser(user) : console.log(confirmed))
      .catch(() => console.log('User dismissed the dialog.'));
  }

  private deleteUser(user: User) {
    this.userService.deleteUser(user.userId).subscribe(
      delData => {
        //console.log(delData);
        if (delData.message == "") {
          this.getUserList();
          this.alertService.success("Record deleted successfully.");
        } else {
          this.alertService.error(delData.message);
        }

      }
    )
  }



  // open new window on double click of user listing
  public opneUserGroup(user) {
    this.selectedUser = user;
    if (this.selectedUser != undefined) {
      $('.bgblur').addClass('ovrlay');
      //this.windowOpened = true;
      this.getAssignedUserGroup(this.selectedUser.userId.toString());
    } else {
      alert('Please select a user first.')
    }
  }

  // on close of security group window
  public close() {
    $('.bgblur').removeClass('ovrlay');
    this.userGroups = [];
    this.windowOpened = false;
  }


  openUserPopup(action, user: User = null) {
    $('.bgblur').addClass('ovrlay');
    this.userFormType = action;
    this.selectedUser = user;
    this.userFormWindow = true;
  }

  closeUserFormWin($event) {
    this.userFormWindow = $event;
    $('.bgblur').removeClass('ovrlay');
    this.getUserList();
  }


  openSearchBar() {
    var scrollTop = $('.layout-container').height();
    $('.search-container').show();
    $('.search-container').css('height', scrollTop);
    if ($('.search-container').hasClass('dismiss')) {
      $('.search-container').removeClass('dismiss').addClass('selectedcs').show();
    }

  }

  closeSearchBar() {
    if ($('.search-container').hasClass('selectedcs')) {
      $('.search-container').removeClass('selectedcs').addClass('dismiss');
      $('.search-container').animate({ width: 'toggle' });
    }
  }

  searchInUserTable(event: any, inputType = null) {
    let values = event.target.value;
    let colNumber = event.target.getAttribute("data-col");
    if (inputType == "select" && values != "") {
      this.usersTable.columns(colNumber).search("^" + values + "$", true, false, true).draw();
    } else {
      this.usersTable.columns(colNumber).search(values).draw();
    }


  }

  clearUserSearchForm() {
    $("#userSearch").trigger("reset");
    this.usersTable.search('').columns().search('').draw();
  }

  exportData() {
    $(".buttons-excel").trigger("click");
  }

  toggleGroupClass($event, userGroup){

  }

}
