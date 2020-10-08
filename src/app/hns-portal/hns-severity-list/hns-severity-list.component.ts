import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State } from '@progress/kendo-data-query';
import { HnsPortalService, AlertService, ConfirmationDialogService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-hns-severity-list',
  templateUrl: './hns-severity-list.component.html',
  styleUrls: ['./hns-severity-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsSeverityListComponent implements OnInit {
  @Input() openSeverityList: boolean = false;
  @Input() selectedDefinition: any;
  @Output() closeSeverityList = new EventEmitter<boolean>();
  gridView: DataResult;
  state: State = {
    skip: 0,
    sort: [],
    take: 30,
    group: [],
    filter: {
      logic: "or",
      filters: []
    }
  }
  // pageSize: number = 30;
  listData: any = [];
  selectedData: any;
  subs = new SubSink();
  title: string = "";
  disableBtn: boolean = false;
  disableAddBtn: boolean = false;
  opneAddSeverity: boolean = false;
  formMode: string = 'add';
  selectedRowIndex = 0;
  hnsPermission: any = [];
  
  constructor(
    private hnsService: HnsPortalService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {

    if (this.selectedDefinition.hasinuse == "Y") {
      this.title = "Edit Severity List - (In Use - Read Only)";
      this.disableBtn = true;
      this.disableAddBtn = true;
    } else {
      this.title = "Edit Severity List";
      this.disableBtn = false;
      this.disableAddBtn = false;
    }
    this.getSeverity({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
    if (this.selectedDefinition.hasinuse == "N") {
      this.selectedRowIndex = rowIndex
      this.selectedData = dataItem;
      this.disableBtn = false;
    }
  }

  closeSeverityListMethod() {
    this.openSeverityList = false;
    this.closeSeverityList.emit(this.openSeverityList)
  }

  getSeverity(SeverityParam) {
    this.subs.add(
      this.hnsService.getSeverityList(SeverityParam).subscribe(
        data => {
          if (data.isSuccess) {
            this.listData = data.data;
            this.gridView = process(this.listData, this.state);
            if (this.selectedDefinition.hasinuse == "N") {
              this.disableAddBtn = false;
              this.disableBtn = true;
            }
            this.chRef.markForCheck();
          }
        }
      )
    )
  }

  public openConfirmationDialog() {
    if (this.selectedData != undefined) {
      $('.k-window-wrapper').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.delete() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    }
  }

  delete() {
    this.subs.add(
      this.hnsService.deleteSeverity(this.selectedData).subscribe(
        data => {
          if (data.isSuccess) {
            this.getSeverity({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

  addSeverity(mode) {
    this.formMode = mode;
    if (this.formMode != "add") {
      if (this.selectedData == undefined) {
        this.alertService.error("Please select one record from list.");
        return
      }
    }
    $('.severityOverlay').addClass('ovrlay');
    this.opneAddSeverity = true;
  }

  closeAddSeverity($event) {
    this.opneAddSeverity = $event;
    $('.severityOverlay').removeClass('ovrlay');
  }

  moveSeverity(where) {
    if (this.selectedData != undefined) {
      let destinationIndex;
      let direction: boolean;
      if (where == "up") {
        if (this.selectedRowIndex > 0) {
          destinationIndex = this.selectedRowIndex - 1;
          direction = true;
        } else {
          return
        }
      } else if (where == "down") {
        if (this.listData.length == this.selectedRowIndex) {
          return
        }
        destinationIndex = this.selectedRowIndex + 1;
        direction = false;
      }

      const params = {
        hascode: this.selectedDefinition.hascode,
        hasversion: this.selectedDefinition.hasversion,
        hasseveritycode: this.selectedData.hasseveritycode,
        destseverityscore: this.listData[destinationIndex].hasseverityscore,
        movedirection: direction
      }

      this.hnsService.moveSeveritySeq(params).subscribe(
        data => {
          //console.log(data);
          if (data.isSuccess) {
            this.getSeverity({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    }

  }

  successFullSubmit($event) {
    if ($event) {
      this.getSeverity({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
    }
  }

}
