import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Group } from '../../../_models'
import { AlertService, LoaderService, AttributeGroupService } from '../../../_services'
import { DataTablesModule } from 'angular-datatables';
import 'datatables.net';
import 'datatables.net-dt';
declare var $: any;

@Component({
  selector: 'app-attribute-group',
  templateUrl: './attribute-group.component.html',
  styleUrls: ['./attribute-group.component.css']
})
export class AttributeGroupComponent implements OnInit {
  constructor(
    private attrGrpService: AttributeGroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
  ) { }

  @Input() attrGrpWindow: boolean = false
  @Input() selectedGroup: Group
  @Output() closeAttrGrpWin = new EventEmitter<boolean>();
  attrGrpTable: any;
  attrGroups: any;
  actualAttrGroups:any;
  tableSetting = {
    scrollY: '62vh',
    colReorder: true,
    scrollCollapse: true,
    paging: true
  }
  public windowWidth = '800';
  public windowHeight = 'auto';
  public windowTop = '37';
  public windowLeft = 'auto';

  ngOnInit() {
    if(this.selectedGroup != ""){
      this.getAllAttributeGroups();
    }
  }

  public closeAttrGrpWindow() {
    this.attrGrpWindow = false;
    this.closeAttrGrpWin.emit(this.attrGrpWindow)  
  }

  public getAllAttributeGroups() {
    this.attrGrpService.getAllAttributeGroups(this.selectedGroup.groupId).subscribe(
      (data) => {
        if (data && data.isSuccess) {
          this.attrGroups = data.data;
          //console.log(this.attrGroups);
          this.actualAttrGroups = data.data;
          this.chRef.detectChanges();
          const grpTable: any = $('.attrGrpTable');
          this.attrGrpTable = grpTable.DataTable(this.tableSetting);
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


  assigneGroup(event: any, aaG_Code) {
    //let isSelected = event.target.checked;
    this.attrGrpService.assigneAttributeGroups(aaG_Code, this.selectedGroup.groupId).subscribe(
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
    this.attrGrpService.getAllAttributeGroups(this.selectedGroup.groupId).subscribe(
      datanew => {
        if (datanew && datanew.isSuccess) {
          this.attrGroups = datanew.data;
          this.actualAttrGroups = datanew.data;
          this.attrGrpTable.destroy();

          if (event.target.checked) {
            let newgrp: any;
            newgrp = this.attrGroups.filter(gr => gr.isSelected == true);
            this.attrGroups = newgrp;
          } else {
            this.attrGroups = this.actualAttrGroups;
          }

          // reinitialize datatable
          this.chRef.detectChanges();
          const table: any = $('.attrGrpTable');
          this.attrGrpTable = table.DataTable(this.tableSetting);
        }
      })

  }


}
