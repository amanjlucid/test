import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { AlertService,  HelperService, ConfirmationDialogService, SharedService, WopmConfigurationService } from '../../../_services'
import { Router } from '@angular/router';
import { WopmContractterm } from '../../../_models'
import { tap, switchMap, debounceTime } from 'rxjs/operators';
import { interval, Subject} from 'rxjs';

@Component({
  selector: 'app-wopm-contract-terms',
  templateUrl: './wopm-contract-terms.component.html',
  styleUrls: ['./wopm-contract-terms.component.css']
})
export class WopmContractTermsComponent implements OnInit {
    subs = new SubSink();
    state: State = {
      skip: 0,
      sort: [],
      group: [],
      filter: {
        logic: "and",
        filters: []
      }
    }
    selectedRow: any;
    rowIndex: any
    allowUnsort = true;
    multiple = false;
    public gridView: DataResult;
    dataDetails: any;
    dataDetailsTemp: any
    selectedItem: any;
    wopmContractterm: WopmContractterm
    amendedTermSave$ = new Subject<any>();
    touchtime = 0;
    public mode: any = 'single';
    currentUser: any;
    loading = true
    wopmSecurityList: any = [];

    constructor(
      private wopmConfigurationService: WopmConfigurationService,
      private alertService: AlertService,
      private confirmationDialogService: ConfirmationDialogService,
      private sharedService: SharedService,
      private router: Router,
      private helper: HelperService
    ) { }

    ngOnInit(): void {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getGridDataDetails();
      //update notification on top
      this.helper.updateNotificationOnTop();

      this.subs.add(
        this.amendedTermSave$
          .pipe(
            debounceTime(2000),
          ).subscribe((val) => {
            this.changedRowData(this.selectedItem);
          })
      );

    }

    keyupevent(dataItem) {
      this.selectedItem = dataItem
      this.amendedTermSave$.next(dataItem);
   }

    ngOnDestroy() {
      this.subs.unsubscribe();
    }

    ngAfterViewInit() {
      this.subs.add(
        this.sharedService.worksOrdersAccess.subscribe(
          data => {
            this.wopmSecurityList = data;
            if (this.wopmSecurityList.length > 0) {
              if (!(this.checkWorksOrdersAccess("Config Contract Terms Tab") && this.checkWorksOrdersAccess("Works Order Portal Access"))) {
                this.router.navigate(['/dashboard']);
              }
            }
          }
        )
      )
    }

    checkWorksOrdersAccess(val: string): Boolean {
       if (this.wopmSecurityList != undefined) {
      return this.wopmSecurityList.includes(val);
      } else {
        return false;
      }
    }

    distinctPrimitive(fieldName: string): any {
      return distinct(this.dataDetails, fieldName).map(item => {
        return { val: item[fieldName], text: item[fieldName] }
      });
    }

    getGridDataDetails() {
      this.subs.add(
        this.wopmConfigurationService.getWorksOrdersContractTermsList().subscribe(
          data => {
            if (data.isSuccess) {
              const contractTerms = data.data;
              this.dataDetails = contractTerms;
              this.dataDetailsTemp = Object.assign([], contractTerms);
              this.gridView = process(this.dataDetailsTemp, this.state);
              this.loading = false;
            }
          }
        )
      )
    }

    public sortChange(sort: SortDescriptor[]): void {
      this.state.sort = sort;
      this.gridView = process(this.dataDetailsTemp, this.state);
    }

    public filterChange(filter: any): void {
      this.state.filter = filter;
      this.gridView = process(this.dataDetailsTemp, this.state);

    }

    private closeEditor(grid, rowIndex) {
      grid.closeRow(rowIndex);
    }

    cellClickHandler({ sender, column, rowIndex, columnIndex, dataItem, isEdited }) {
      this.closeEditor(sender, rowIndex);
     // this.selectedRow = dataItem;
      this.rowIndex = rowIndex
      // console.log(this.selectedParam)
      if (columnIndex > 0) {
        sender.editCell(rowIndex, columnIndex);
      }
    }

    keydownevent(dataItem) {
      this.changedRowData(dataItem);
    }

    changedRowData(dataItem) {
      this.selectedRow = dataItem
      if(this.checkWorksOrdersAccess("Config Contract Terms Apply") == false)
      {
        return;
      }
      if (dataItem.contractTermText != dataItem.originalTermText)
      {
        dataItem.originalTermText = dataItem.contractTermText;
        setTimeout(() => {
          let wopmContractterm = new WopmContractterm();
          wopmContractterm.contractTermText = this.selectedRow.contractTermText;
          wopmContractterm.contractTermTextName  = this.selectedRow.contractTermTextName;
          wopmContractterm.contractTermType = this.selectedRow.contractTermType;
          wopmContractterm.contractTermStatus  = this.selectedRow.contractTermStatus;
          wopmContractterm.contractTermDisplayGroup  = this.selectedRow.contractTermDisplayGroup;
          wopmContractterm.userID = this.currentUser.userId;
          this.subs.add(
            this.wopmConfigurationService.updateContractTerm(wopmContractterm).pipe(switchMap(x => interval(100))).subscribe()
          )
        }, 300);
      }

    }

    export() {
     if (this.dataDetails.length != undefined && this.dataDetails.length > 0) {
      let tempData = this.dataDetails;
      let label = {
        'contractTermTextName': 'Contract Term Name',
        'contractTermText': 'Contract Term Wording',
      }

       this.helper.exportAsExcelFile(tempData, 'Refusal Codes', label)

     } else {
       alert('There is no data to export');
     }
  }


}

