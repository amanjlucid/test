import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Group, ElementGroupModel } from '../../../_models'
import { AlertService, LoaderService, ElementGroupService } from '../../../_services'
import { DataTablesModule } from 'angular-datatables';
import 'datatables.net';
import 'datatables.net-dt';
declare var $: any;


@Component({
  selector: 'app-elements-group',
  templateUrl: './elements-group.component.html',
  styleUrls: ['./elements-group.component.css']
})
export class ElementsGroupComponent implements OnInit {

  constructor(
    private elmGrpService: ElementGroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
  ) { }

  @Input() elmGrpWindow: boolean = false
  @Input() selectedGroup: Group
  @Output() closeElmGrpWin = new EventEmitter<boolean>();
  elmGrpTable: any;
  elmGroups: ElementGroupModel[];
  actualElmGroups:ElementGroupModel[];
  tableSetting = {
    scrollY: '59vh',
    colReorder: true,
    scrollCollapse: true,
    paging: true
  }
  public windowWidth = '800';
  public windowHeight = 'auto';
  public windowTop = '40';
  public windowLeft = 'auto';

  ngOnInit() {
    if(this.selectedGroup != ""){
      this.getAllElementGroups();
    }
  }

  public closeElmGrpWindow() {
    this.elmGrpWindow = false;
    this.closeElmGrpWin.emit(this.elmGrpWindow)
  }

  public getAllElementGroups() {
    this.elmGrpService.getAllElementGroups(this.selectedGroup.groupId).subscribe(
      (data) => {
        if (data && data.isSuccess) {
          this.elmGroups = data.data;
          //console.log(this.elmGroups);
          this.actualElmGroups = data.data;
          this.chRef.detectChanges();
          const grpTable: any = $('.elmGrpTable');
          this.elmGrpTable = grpTable.DataTable(this.tableSetting);
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


  assigneGroup(event: any, elemCode) {
    //let isSelected = event.target.checked;
    this.elmGrpService.assigneElementGroups(elemCode, this.selectedGroup.groupId).subscribe(
      data => {
        if (data && data.isSuccess) {
          console.log(data);
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

  includeOnlyGroup(event: any) {
    this.elmGrpService.getAllElementGroups(this.selectedGroup.groupId).subscribe(
      datanew => {
        if (datanew && datanew.isSuccess) {
          this.elmGroups = datanew.data;
          this.actualElmGroups = datanew.data;
          this.elmGrpTable.destroy();

          if (event.target.checked) {
            let newgrp: any;
            newgrp = this.elmGroups.filter(gr => gr.isSelected == true);
            this.elmGroups = newgrp;
          } else {
            this.elmGroups = this.actualElmGroups;
          }

          // reinitialize datatable
          this.chRef.detectChanges();
          const table: any = $('.elmGrpTable');
          this.elmGrpTable = table.DataTable(this.tableSetting);
        }
      })

  }

}
