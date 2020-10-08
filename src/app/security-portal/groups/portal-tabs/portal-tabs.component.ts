import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Group, PortalTabsModel } from '../../../_models'
import { AlertService, LoaderService, PortalGroupService } from '../../../_services'
import { DataTablesModule } from 'angular-datatables';
import 'datatables.net';
import 'datatables.net-dt';
declare var $: any;

@Component({
  selector: 'app-portal-tabs',
  templateUrl: './portal-tabs.component.html',
  styleUrls: ['./portal-tabs.component.css']
})
export class PortalTabsComponent implements OnInit {
  constructor(
    private portalGrpService: PortalGroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
  ) { }

  @Input() portalGrpWindow: boolean = false
  @Input() selectedGroup: Group
  @Output() closePortalGrpWin = new EventEmitter<boolean>();
  poratalGrpTable: any;
  portalGroups: PortalTabsModel[];
  actualPortalGroups:PortalTabsModel[];
  tableSetting = {
    scrollY: '59vh',
    colReorder: true,
    scrollCollapse: true,
    paging: true
  }
  public windowWidth = '800';
  public windowHeight = 'auto';
  public windowTop = '45';
  public windowLeft = 'auto';

  ngOnInit() {
    if(this.selectedGroup != ""){
      this.getAllPortaltabas();
    }
  }

  public closePortalGrpWindow() {
    this.portalGrpWindow = false;
    this.closePortalGrpWin.emit(this.portalGrpWindow)  
  }

  public getAllPortaltabas() {
    this.portalGrpService.getAllPortaltabas(this.selectedGroup.groupId).subscribe(
      (data) => {
        if (data && data.isSuccess) {
          this.portalGroups = data.data;
          //console.log(this.portalGroups);
          this.actualPortalGroups = data.data;
          this.chRef.detectChanges();
          const grpTable: any = $('.portalGrpTable');
          this.poratalGrpTable = grpTable.DataTable(this.tableSetting);
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


  assigneGroup(event: any, portalId) {
    //let isSelected = event.target.checked;
    this.portalGrpService.assignePortalTabGroups(portalId, this.selectedGroup.groupId).subscribe(
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
    this.portalGrpService.getAllPortaltabas(this.selectedGroup.groupId).subscribe(
      datanew => {
        if (datanew && datanew.isSuccess) {
          this.portalGroups = datanew.data;
          this.actualPortalGroups = datanew.data;
          this.poratalGrpTable.destroy();

          if (event.target.checked) {
            let newgrp: any;
            newgrp = this.portalGroups.filter(gr => gr.isSelected == true);
            this.portalGroups = newgrp;
          } else {
            this.portalGroups = this.actualPortalGroups;
          }

          // reinitialize datatable
          this.chRef.detectChanges();
          const table: any = $('.portalGrpTable');
          this.poratalGrpTable = table.DataTable(this.tableSetting);
        }
      })

  }

}
