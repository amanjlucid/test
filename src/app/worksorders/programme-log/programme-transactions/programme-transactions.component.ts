import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, ConfirmationDialogService ,WorksorderManagementService , WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-programme-transactions',
    templateUrl: './programme-transactions.component.html',
    styleUrls: ['./programme-transactions.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProgramTransactionsComponent implements OnInit {
    @Input() ProgrammeTransactionWindow: boolean = false;
    @Output() ProgramTransactionsWindowEvent = new EventEmitter<boolean>();
    @Input() worksOrderData: any;
    @Input() programLog: any;
    @Input() programmeData: any;

    subs = new SubSink();

    state: State = {
        skip: 0,
        sort: [],
        group: [],
        filter: {
            logic: "or",
            filters: []
        }
    }

    public filter: CompositeFilterDescriptor;
    pageSize = 25;
    title = 'View Programme Transaction';

    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    loading = false;

    gridData: any;
    gridView: DataResult;
    selectedItem: any;



        constructor(
            private worksOrdersService: WorksOrdersService,
            private alertService: AlertService,
            private chRef: ChangeDetectorRef,
            private sharedService: SharedService,
            private confirmationDialogService: ConfirmationDialogService,
        ) { }



        ngOnInit(): void {


        //  console.log('WorkOrder Data : '+  JSON.stringify(this.worksOrderData));

            this.WEBWorksOrdersWorksProgrammeLogDetails();
        }

        ngOnDestroy() {
          this.subs.unsubscribe();
      }

      sortChange(sort: SortDescriptor[]): void {
          this.state.sort = sort;
          this.gridView = process(this.gridData, this.state);
          this.chRef.detectChanges();
      }

      filterChange(filter: any): void {
          this.state.filter = filter;
          this.gridView = process(this.gridData, this.state);
          this.chRef.detectChanges();
      }

      pageChange(event: PageChangeEvent): void {
          this.state.skip = event.skip;
          this.gridView = {
              data: this.gridData.slice(this.state.skip, this.state.skip + this.pageSize),
              total: this.gridData.length
          };
          this.chRef.detectChanges();
      }

      cellClickHandler({
          sender,
          column,
          rowIndex,
          columnIndex,
          dataItem,
          isEditedselectedInstructionRow
      }) {
          this.selectedItem = dataItem;
      }





      WEBWorksOrdersWorksProgrammeLogDetails() {


          const params = {
              "intWPRSEQUENCE": this.programLog.wprsequence,
              "intWPLSEQUENCE": this.programLog.wplsequence,
          };

          const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



          this.subs.add(
              this.worksOrdersService.WEBWorksOrdersWorksProgrammeLogDetails(qs).subscribe(
                  data => {


                    //  console.log('GetWOInstructionAssets api data ' + JSON.stringify(data));

                      if (data.isSuccess) {

                          this.gridData = data.data;


                      } else {
                          this.alertService.error(data.message);
                          this.loading = false
                      }

                      this.chRef.detectChanges();

                      // console.log('WorkOrderRefusalCodes api reponse' + JSON.stringify(data));
                  },
                  err => this.alertService.error(err)
              )
          )




      }

      CloseProgramLogTransactionsWindow() {
          this.ProgrammeTransactionWindow = false;
          this.ProgramTransactionsWindowEvent.emit(this.ProgrammeTransactionWindow);
      }






}
