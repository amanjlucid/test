import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { AlertService, LoaderService, FunctionSecurityService } from '../../../_services'
import { Group, FunctionSecurityModel } from '../../../_models'


import { DataTablesModule } from 'angular-datatables';
import 'datatables.net';
import 'datatables.net-dt';
declare var $: any;

@Component({
  selector: 'app-function-security',
  templateUrl: './function-security.component.html',
  styleUrls: ['./function-security.component.css']
})
export class FunctionSecurityComponent implements OnInit {


  public windowState = 'maximized';
  functionPortals: any;
  selectedPortal: any;
  functionType: any
  selectedFunctionType: any;
  currentUser;
  availableFunctions: FunctionSecurityModel[];
  assignedFunctions: FunctionSecurityModel[];
  availableFunctionTable: any;
  assignedFunctionTable: any;
  availableFunctionLists: FunctionSecurityModel[] = [];
  assignedFunctionLists: FunctionSecurityModel[] = [];
  tableSetting = {
    scrollY: '22rem',
    scrollCollapse: true,
    bLengthChange: false,
    paging: true
  }


  @Input() functionSecurityWindow: boolean = false;
  @Input() selectedGroup: Group
  @Output() closeWindow = new EventEmitter<boolean>();

  constructor(
    private functionSecService: FunctionSecurityService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.createSession();
  }

  public closeFunctionSecWindow() {
    this.cancelGroupFunctions();
    this.functionSecurityWindow = false;
    this.closeWindow.emit(this.functionSecurityWindow)

  }


  public createSession() {
    this.functionSecService.createSession(this.selectedGroup.groupId, this.currentUser.userId).subscribe(
      data => {

        if (data && data.data == "Y") {
          this.getPortalLIst();
          this.getFunctionType();
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }

      }
    )
  }

  public getPortalLIst() {
    this.functionSecService.getFunctionPortals(this.selectedGroup.workOrderLevel).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.functionPortals = data.data;
          this.selectedPortal = this.functionPortals[0];
          this.getAllFunctionList();
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      },
      error => {
        this.loaderService.hide();
        this.alertService.error(error);
      }
    )
  }


  public getFunctionType() {
    this.functionSecService.getFunctionTypes(this.selectedGroup.workOrderLevel).subscribe(
      data => {
        if (data && data.isSuccess) {
          this.functionType = data.data;
          this.selectedFunctionType = this.functionType[0];
          this.getAllFunctionList();
          //console.log(this.functionType)
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      },
      error => {
        this.loaderService.hide();
        this.alertService.error(error);
      }
    )
  }


  getAllFunctionList() {
    if (this.selectedPortal && this.selectedFunctionType && this.selectedGroup) {
      this.availableFunction();
      this.assignedFunction();
    }
  }


  availableFunction() {

    this.functionSecService.availableFunctionList(this.selectedPortal, this.selectedFunctionType, this.currentUser.userId, this.selectedGroup.groupId)
      .subscribe(
        data => {
          if (data && data.isSuccess) {
            if (this.availableFunctionTable != undefined) {
              this.availableFunctionTable.destroy();
            }
            this.availableFunctions = data.data;

            this.chRef.detectChanges();
            const grpTable: any = $('.availableFunctionTable');
            this.availableFunctionTable = grpTable.DataTable(this.tableSetting);
          } else {
            this.loaderService.hide();
            this.alertService.error(data.message);
          }
        }
      )
  }

  assignedFunction() {
    this.functionSecService.assignedFunctionList(this.selectedPortal, this.selectedFunctionType, this.currentUser.userId, this.selectedGroup.groupId).subscribe(
      data => {
        if (data && data.isSuccess) {
          if (this.assignedFunctionTable != undefined) {
            this.assignedFunctionTable.destroy();
          }
          this.assignedFunctions = data.data;
          this.chRef.detectChanges();
          const grpTable: any = $('.assignedFunctionTable');
          this.assignedFunctionTable = grpTable.DataTable(this.tableSetting);
        } else {
          this.loaderService.hide();
          this.alertService.error(data.message);
        }
      }
    )
  }


  toggleAvailableFunction(event: any, availableFunction) {
    const parent = event.target.parentNode;
    parent.classList.toggle("selected");

    //if (this.availableFunctionLists.includes(availableFunction)) {
    if (this.availableFunctionLists.some(x => JSON.stringify(x) === JSON.stringify(availableFunction))) {
      this.availableFunctionLists = this.availableFunctionLists.filter(x => x.functionName != availableFunction.functionName);
    } else {
      availableFunction.toTemp = true;
      this.availableFunctionLists.push(availableFunction);
    }

  }


  includeAvailableFunction(incAll = false) {

    if (incAll) {
      this.availableFunctionLists = this.availableFunctions.filter(x => x.toTemp = true); // change toTemp value to true to include
    }
    if (this.availableFunctionLists) {
      this.functionSecService.includeAvailableFncToAssined(this.availableFunctionLists).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.getAllFunctionList();
            this.availableFunctionLists = [];
          } else {
            this.loaderService.hide();
            this.alertService.error(data.message);
          }
        },
        error => {
          this.loaderService.hide();
          this.alertService.error(error);
        }
      )
    }
  }


  toggleAssignedFunction(event: any, assignedFunction) {
    const parent = event.target.parentNode;
    parent.classList.toggle("selected");


    // if (this.assignedFunctionLists.includes(assignedFunction)) {
    if (this.assignedFunctionLists.some(x => JSON.stringify(x) === JSON.stringify(assignedFunction))) {
      this.assignedFunctionLists = this.assignedFunctionLists.filter(x => x.functionName != assignedFunction.functionName);
    } else {
      assignedFunction.toTemp = false;  // make assigned function toTemp index to true to include
      this.assignedFunctionLists.push(assignedFunction);
    }

  }


  removeAvailableFunction(remAll = false) {
    if (remAll) {
      //console.log(this.assignedFunctions);
      this.assignedFunctionLists = this.assignedFunctions;
      //console.log(this.assignedFunctionLists)
    }
    if (this.assignedFunctionLists) {
      this.functionSecService.removeAvailableFncFromAssined(this.assignedFunctionLists).subscribe(
        data => {
          if (data && data.isSuccess) {
            this.getAllFunctionList();
            this.assignedFunctionLists = [];
          } else {
            this.loaderService.hide();
            this.alertService.error(data.message);
          }
        },
        error => {
          this.loaderService.hide();
          this.alertService.error(error);
        }
      )
    }
  }


  saveGroupFunction() {
    if (this.availableFunctions && this.assignedFunctions) {
      this.functionSecService.saveGroupFunctions(this.selectedGroup.groupId, this.currentUser.userId).subscribe(
        data => {
          this.closeFunctionSecWindow();
        }
      )
    }
  }

  cancelGroupFunctions() {
    if (this.availableFunctions && this.assignedFunctions) {
      this.functionSecService.cancelGroupFunctions(this.selectedGroup.groupId, this.currentUser.userId).subscribe()
    }
  }

}
