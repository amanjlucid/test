import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, RowArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AlertService, LoaderService, CharacteristicGroupService } from '../../../_services'
import { Group, CharateristicGroupModel } from '../../../_models'

@Component({
  selector: 'app-characteristic-group',
  templateUrl: './characteristic-group.component.html',
  styleUrls: ['./characteristic-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class CharacteristicGroupComponent implements OnInit {
  subs = new SubSink();
  @Input() selectedGroup;
  charGroups: CharateristicGroupModel[]
  state: State = {
    skip: 0,
    sort: [],
    take: 25,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  gridView: DataResult;
  pageSize = 25;
  loading = true;
  selectableSettings: SelectableSettings;
  mySelection: any = [];
  mySelectionKey(context: RowArgs): string {
    return context.dataItem.groupID
  }
  booleanFilterDropDown = [{ valid: "A", val: "Active" }, { valid: "I", val: "Inactive" }];
  gridHeight = 700;




  constructor(
    private charGrpService: CharacteristicGroupService,
    private alertService: AlertService,
    private loaderService: LoaderService,
    private chRef: ChangeDetectorRef,
  ) {
    this.setSelectableSettings();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };
  }


  // charGrpTable: any;
  // charGroups: CharateristicGroupModel[];
  // actualCharGroups: CharateristicGroupModel[];
  // tableSetting = {
  //   scrollY: '59vh',
  //   colReorder: true,
  //   scrollCollapse: true,
  //   paging: true
  // }
  // public windowWidth = '800';
  // public windowHeight = 'auto';
  // public windowTop = '40';
  // public windowLeft = 'auto';


  ngOnInit() {
    this.getAllCharacteristicGroups()
  }

  getAllCharacteristicGroups() {
    this.subs.add(
      this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupID).subscribe(
        data => {
          console.log(data)
          if (data && data.isSuccess) {
            this.charGroups = data.data;
            this.gridView = process(this.charGroups, this.state);
            this.loading = false;
            this.chRef.detectChanges()
          }
        }
      )
    )
  }

  includeOnlyGroup(event: any) {
    this.loading = true;
    this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupID).subscribe(
      data => {
        if (data && data.isSuccess) {
          if (event.target.checked) {
            this.charGroups = data.data.filter(x => x.isSelected == true)
          } else {
            this.charGroups = data.data;
          }

          this.gridView = process(this.charGroups, this.state);
          this.loading = false;
          this.chRef.detectChanges()
        }
      }
    )
  }

  assigneGroup(event: any, charGroupId) {
    // const isSelected = event.target.checked;
    this.charGrpService.assigneCharacteristicGroups(charGroupId, this.selectedGroup.groupID).subscribe(
      data => {
        if (data.isSuccess == false) {
          this.alertService.error(data.message);
        }
      }, error => this.alertService.error(error)
    );
  }

  cellClickHandler({ columnIndex, dataItem }) {
    this.selectedGroup = dataItem;
    // this.checkCanDelete(dataItem);
  }

  sortChange(sort: SortDescriptor[]): void {
    this.resetGrid()
    this.state.sort = sort;
    this.gridView = process(this.charGroups, this.state);
  }

  filterChange(filter: any): void {
    this.resetGrid()
    this.state.filter = filter;
    this.gridView = process(this.charGroups, this.state);
  }


  pageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.gridView = {
      data: this.charGroups.slice(this.state.skip, this.state.skip + this.pageSize),
      total: this.charGroups.length
    };
  }

  resetGrid() {
    this.state.skip = 0;
  }


  // public closeCharGropWindow() {
  //   this.charGrpWindow = false;
  //   this.closeCharGrpWin.emit(this.charGrpWindow)
  // }

  // public getAllCharacteristicGroups() {
  //   this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupId).subscribe(
  //     (data) => {
  //       if (data && data.isSuccess) {
  //         this.charGroups = data.data;
  //         this.chRef.detectChanges();
  //         const grpTable: any = $('.charGrpTable');
  //         this.charGrpTable = grpTable.DataTable(this.tableSetting);
  //       } else {
  //         this.loaderService.hide();
  //         this.alertService.error(data.message);
  //       }
  //     },
  //     (error) => {

  //       this.loaderService.hide();
  //       this.alertService.error(error);
  //     }
  //   )
  // }

  // assigneGroup(event: any, charGroupId) {
  //   //let isSelected = event.target.checked;
  //   this.charGrpService.assigneCharacteristicGroups(charGroupId, this.selectedGroup.groupId).subscribe(
  //     data => {
  //       if (data && data.isSuccess) {
  //         //console.log(data);
  //       } else {
  //         this.loaderService.hide();
  //         this.alertService.error(data.message);
  //       }
  //     },
  //     error => {
  //       this.loaderService.hide();
  //       this.alertService.error(error);
  //     }
  //   );
  // }

  // includeOnlyGroup(event: any) {
  //   this.charGrpService.getAllCharacteristicGroups(this.selectedGroup.groupId).subscribe(
  //     datanew => {
  //       if (datanew && datanew.isSuccess) {
  //         this.charGroups = datanew.data;
  //         this.actualCharGroups = datanew.data;
  //         this.charGrpTable.destroy();

  //         if (event.target.checked) {
  //           let newgrp: any;
  //           newgrp = this.charGroups.filter(gr => gr.isSelected == true);
  //           this.charGroups = newgrp;
  //         } else {
  //           this.charGroups = this.actualCharGroups;
  //         }

  //         // reinitialize datatable
  //         this.chRef.detectChanges();
  //         const table: any = $('.charGrpTable');
  //         this.charGrpTable = table.DataTable(this.tableSetting);
  //       }
  //     })

  // }
}
