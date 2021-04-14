import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State } from '@progress/kendo-data-query';
import { HnsPortalService, AlertService, ConfirmationDialogService, SharedService } from 'src/app/_services';

@Component({
  selector: 'app-hns-scoring-bands',
  templateUrl: './hns-scoring-bands.component.html',
  styleUrls: ['./hns-scoring-bands.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsScoringBandsComponent implements OnInit {
  @Input() openScoringBand: boolean = false;
  @Input() selectedDefinition: any;
  @Output() closeScoringBands = new EventEmitter<boolean>();
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
  title: string = "Edit Scoring Bands...";
  disableBtn: boolean = true;
  disableAddBtn: boolean = true;
  openAddScoringBand: boolean = false;
  formMode: string = 'add';
  range: any = { min: 0, max: 100 };
  updatedRange: any = { min: null, max: null, maxRowInd: 0 };
  currentUser: any;
  hnsPermission: any = [];
  ScoringBandRules: boolean = false;

  constructor(
    private hnsService: HnsPortalService,
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.subs.add(
      this.sharedService.scoringBandObs.subscribe(
        data => {
          this.listData = data;
          this.renderGrid(this.listData);
        }
      )
    )
    this.getScoringbands({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
  
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
    this.selectedData = dataItem;
    this.disableBtn = false;

  }

  closeWindowMethod() {
    this.changeScoringBandList([]); // empty grid
    this.openScoringBand = false;
    this.closeScoringBands.emit(this.openScoringBand)
  }

  getScoringbands(params) {
    this.subs.add(
      this.hnsService.getScoringBands(params).subscribe(
        data => {
          if (data.isSuccess) {
            this.listData = data.data;
            this.changeScoringBandList(this.listData);
          }
        }
      )
    )
  }


  renderGrid(listData) {
    this.gridView = process(listData, this.state);
    this.disableAddBtn = false;
    this.chRef.markForCheck();
    if (listData.length > 0 && this.selectedDefinition.hasscoring == 1) {
      this.updatedRange.max = null;
      this.updatedRange.min = null;
      listData.forEach((v, i) => {
        // updated min max
        if (this.updatedRange.max == null) {
          this.updatedRange.max = v.hasscorebandhigh;
          this.updatedRange.maxRowInd = i;
        } else {
          if (v.hasscorebandhigh > this.updatedRange.max) {
            this.updatedRange.max = v.hasscorebandhigh;
            this.updatedRange.maxRowInd = i;
          } else {
            this.updatedRange.max = this.updatedRange.max;
            this.updatedRange.maxRowInd = this.updatedRange.maxRowInd;
          }
        }
        if (this.updatedRange.min == null) {
          this.updatedRange.min = v.hasscorebandlow;
          this.updatedRange.minRowInd = i;
        } else {
          this.updatedRange.min = (v.hasscorebandlow < this.updatedRange.min) ? v.hasscorebandlow : this.updatedRange.min;
          this.updatedRange.minRowInd =  (v.hasscorebandlow < this.updatedRange.min) ? i : this.updatedRange.minRowInd;
        }
      });
    }

   // console.log(this.updatedRange);
  }

  changeScoringBandList(list: any) {
    this.sharedService.changeScoringBands(list);
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
    this.listData = this.listData.filter(x => x != this.selectedData).map(x => {
      x.modifiedby = this.currentUser.userId;
      // x.hasscoringbandname = x.hasscorebandname;
      return x;
    });;
    this.sharedService.changeScoringBands(this.listData);
  }

  addScoringBand(mode) {
    this.formMode = mode;
    if (this.formMode != "add") {
      if (this.selectedData == undefined) {
        this.alertService.error("Please select one record from list.");
        return
      }
    }
    $('.scoringBandOverlay').addClass('ovrlay');
    this.openAddScoringBand = true;
  }

  closeAddScoringBand($event) {
    this.disableBtn = true;
    this.openAddScoringBand = $event;
    $('.scoringBandOverlay').removeClass('ovrlay');
  }

  successFullSubmit($event) {
    if ($event) {
      this.getScoringbands({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
    }
  }

  confirmSaveBands() {
    if (this.range.max != this.updatedRange.max) {
      const maxRowInd = this.updatedRange.maxRowInd;
      if (this.listData[maxRowInd] != undefined) {
        $('.k-window').css({ 'z-index': 1000 });
        this.confirmationDialogService.confirm('', `Highest Band (${this.listData[maxRowInd].hasscorebandlow}...${this.listData[maxRowInd].hasscorebandhigh}) did not reach 100%. Updated to (${this.listData[maxRowInd].hasscorebandlow}...${this.range.max})`, false)
          .then((confirmed) => (confirmed) ? this.saveBands() : console.log(confirmed))
          .catch(() => console.log('Attribute dismissed the dialog.'));
      } else {
        this.saveBands()
      }
    } else {
      this.saveBands()
    }

  }

  saveBands() {
    if (this.range.max != this.updatedRange.max) {
      const maxRowInd = this.updatedRange.maxRowInd;
      if (this.listData[maxRowInd] != undefined) {
        this.listData[maxRowInd].hasscorebandhigh = this.range.max;
      }
    }

    if (this.range.min != this.updatedRange.min) {
      const minRowInd = this.updatedRange.minRowInd;
      if (this.listData[minRowInd] != undefined) {
        this.listData[minRowInd].hasscorebandlow = this.range.min;
      }
    }

    // check if table is empty then set hascode and hasversion to delete records
    if (this.listData.length == 0) {
      this.listData.push(
        {
          hascode: this.selectedDefinition.hascode,
          hasversion: this.selectedDefinition.hasversion,
          hasscorebandname: '',
          hasscorebandlow: '',
          hasscorebandhigh: '',
        }
      )
    }
    //console.log(this.listData);
    
    this.subs.add(
      this.hnsService.addScoringBand(this.listData).subscribe(
        data => {
          if (data.isSuccess) {
            this.getScoringbands({ hasCode: this.selectedDefinition.hascode, hasVersion: this.selectedDefinition.hasversion });
            this.alertService.success("Scoring band saved successfully")
          } else {
            this.alertService.error(data.message)
          }
        }
      )
    )

  }

}
