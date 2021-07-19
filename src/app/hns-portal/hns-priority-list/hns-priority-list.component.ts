import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State } from '@progress/kendo-data-query';
import { HnsPortalService, AlertService, ConfirmationDialogService, SharedService } from 'src/app/_services';


@Component({
  selector: 'app-hns-priority-list',
  templateUrl: './hns-priority-list.component.html',
  styleUrls: ['./hns-priority-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HnsPriorityListComponent implements OnInit {
  @Input() openPriorityList: boolean = false;
  @Input() selectedDefinition: any;
  @Output() closePriorityList = new EventEmitter<boolean>();
  gridView: DataResult;
  state: State = {
    skip: 0,
    sort: [],
    take: 30,
    group: [],
    filter: {
      logic: "and",
      filters: []
    }
  }
  // pageSize: number = 30;
  listData: any;
  selectedData: any;
  subs = new SubSink();
  title: string = "";
  disableBtn: boolean = false;
  disableAddBtn: boolean = false;
  openAddPriority: boolean = false;
  formMode: string = 'add';
  selectedRowIndex = 0;
  range: any = { min: 1, max: 1 };
  updatedRange: any = { min: 0, max: 0 };
  hnsPermission: any = [];
  currentUser: any;

  constructor(
    private hnsService: HnsPortalService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService
  ) { }

  //A1ATEST
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.selectedDefinition.hasinuse == "Y") {
      this.title = "View Priority List - (In Use - Read Only)";
      this.disableBtn = true;
      this.disableAddBtn = true;
    } else {
      this.title = "Edit Priority List";
      this.disableBtn = false;
      this.disableAddBtn = false;
    }

    this.getPriorityList({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
    if (this.selectedDefinition.hasscoring == 2) {
      this.getMinAndMax({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
    }

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

  closePriorityListMethod() {

    let missingRange = this.validateScoreData();

    if (missingRange != '' && this.selectedDefinition.hasscoring == 2) {
      this.alertService.error(missingRange + `. This definition cannot be used until this is complete.`);
    //     return

    }
    this.openPriorityList = false;
    this.closePriorityList.emit(this.openPriorityList)
  }

  getPriorityList(priorityParam) {
    this.subs.add(
      this.hnsService.getPriorityList(priorityParam).subscribe(
        data => {
          //console.log(data)
          if (data.isSuccess) {
            // const tempData = data.data;
            this.listData = data.data;
            this.gridView = process(this.listData, this.state);
            if (this.listData.length > 0 && this.selectedDefinition.hasscoring == 2) {
              //reset with latest min max in grid
              this.updatedRange.max = 0;
              this.updatedRange.min = 0;
              this.listData.forEach((v, i) => {
                // updated min max
                if (this.updatedRange.max == 0) {
                  this.updatedRange.max = v.hasriskupper
                } else {
                  this.updatedRange.max = (v.hasriskupper > this.updatedRange.max) ? v.hasriskupper : this.updatedRange.max;
                }
                if (this.updatedRange.min == 0) {
                  this.updatedRange.min = v.hasrisklower;
                } else {
                  this.updatedRange.min = (v.hasrisklower < this.updatedRange.min) ? v.hasrisklower : this.updatedRange.min;
                }
              });
            }

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
      $('.k-window').css({ 'z-index': 1000 });
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.delete() : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
    }
  }

  delete() {

    this.selectedData.modifiedby = this.currentUser.userId
    this.subs.add(
      this.hnsService.deletePriority(this.selectedData).subscribe(
        data => {
          if (data.isSuccess) {
            this.alertService.success(`Priority ${this.selectedData.haspriority} has been successfully deleted.`)
            this.getPriorityList({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

  addPriority(mode) {
    this.formMode = mode;
    if (this.formMode != "add") {
      if (this.selectedData == undefined) {
        this.alertService.error("Please select one record from list.");
        return
      }
    }
    $('.priorityOverlay').addClass('ovrlay');
    this.openAddPriority = true;
  }

  closeAddPriority($event) {
    this.openAddPriority = $event;
    $('.priorityOverlay').removeClass('ovrlay');
  }

  movePriority(where) {
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
      haspriority: this.selectedData.haspriority,
      destiniationprioritysequence: this.listData[destinationIndex].haspriorityorder,
      movedirection: direction,
      modifiedby: this.currentUser.userId
    }

    this.hnsService.movePrioritySeq(params).subscribe(
      data => {
        //console.log(data);
        if (data.isSuccess) {
          this.getPriorityList({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
        } else {
          this.alertService.error(data.message);
        }
      }
    )

  }

  successFullSubmit($event) {
    if ($event) {
      this.getPriorityList({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
    }
  }

  getMinAndMax(params) {
    this.subs.add(
      this.hnsService.getPriorityMinNmaxScore(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.range.min = data.data.minscore;
            this.range.max = data.data.maxscore;
          } else {
            this.alertService.error(data.message);
          }
        }
      )
    )
  }

validateScoreData(){

let res = '';

    let coveredValue = [];

    for (let elm of this.listData) {
      //if (!coveredValue.indexOf(elm.) == -1)
      for (let i = elm.hasrisklower; i <= elm.hasriskupper; i++) {
        if (coveredValue.indexOf(i) == -1) {
          coveredValue.push(i);
        }
        else
        {
          return 'The Lower and Upper Score Limits must not ovelap between priority levels';
        }
      }
    }

    for (let i = this.range.min; i <= this.range.max; i++) {
      if (coveredValue.indexOf(i) === -1) {
        return "The Lower and Upper Score Limits do not cover the complete range Please ensure the Score Limits cover all values from " + this.range.min + " to " + this.range.max;
      }
    }

    return res;

  }
/*
  checkLeftRangeValue() {
    let flag = true;
    let coveredValue = [];

    for (let i = this.range.min; i <= this.range.max; i++) {
      if (this.listData.length > 0 && this.selectedDefinition.hasscoring == 2) {
        for (let elm of this.listData) {
          if (i >= elm.hasrisklower && i <= elm.hasriskupper) {
            coveredValue.push(i);
            break;
          }
        }
      }
    }

    for (let i = this.range.min; i <= this.range.max; i++) {
      if (coveredValue.indexOf(i) === -1) {
        flag = false;
      }
    }

    return flag;
  }
*/

}
