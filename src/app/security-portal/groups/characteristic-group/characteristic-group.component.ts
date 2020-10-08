import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Group, CharateristicGroupModel } from '../../../_models'
import { AlertService, LoaderService, CharacteristicGroupService } from '../../../_services'
import { DataTablesModule } from 'angular-datatables';
import 'datatables.net';
import 'datatables.net-dt';
declare var $: any;

@Component({
  selector: 'app-characteristic-group',
  templateUrl: './characteristic-group.component.html',
  styleUrls: ['./characteristic-group.component.css']
})
export class CharacteristicGroupComponent implements OnInit {

  constructor(
    private charGrpService: CharacteristicGroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
  ) { }

  @Input() charGrpWindow: boolean = false
  @Input() selectedGroup: Group
  @Output() closeCharGrpWin = new EventEmitter<boolean>();
  charGrpTable: any;
  charGroups: CharateristicGroupModel[];
  actualCharGroups: CharateristicGroupModel[];
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
    if (this.selectedGroup != "") {
      this.getAllCharacteristicGroups();
    }
  }


  public closeCharGropWindow() {
    this.charGrpWindow = false;
    this.closeCharGrpWin.emit(this.charGrpWindow)
  }

  public getAllCharacteristicGroups() {
    this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupId).subscribe(
      (data) => {
        if (data && data.isSuccess) {
          this.charGroups = data.data;
          this.chRef.detectChanges();
          const grpTable: any = $('.charGrpTable');
          this.charGrpTable = grpTable.DataTable(this.tableSetting);
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

  assigneGroup(event: any, charGroupId) {
    //let isSelected = event.target.checked;
    this.charGrpService.assigneCharacteristicGroups(charGroupId, this.selectedGroup.groupId).subscribe(
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

  includeOnlyGroup(event: any) {
    this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupId).subscribe(
      datanew => {
        if (datanew && datanew.isSuccess) {
          this.charGroups = datanew.data;
          this.actualCharGroups = datanew.data;
          this.charGrpTable.destroy();

          if (event.target.checked) {
            let newgrp: any;
            newgrp = this.charGroups.filter(gr => gr.isSelected == true);
            this.charGroups = newgrp;
          } else {
            this.charGroups = this.actualCharGroups;
          }

          // reinitialize datatable
          this.chRef.detectChanges();
          const table: any = $('.charGrpTable');
          this.charGrpTable = table.DataTable(this.tableSetting);
        }
      })

  }
}
