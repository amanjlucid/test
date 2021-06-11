import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import { DataResult, process, State, SortDescriptor } from '@progress/kendo-data-query';
import { AlertService, HelperService, LoaderService, ConfirmationDialogService ,WorksorderManagementService , WorksOrdersService, PropertySecurityGroupService, SharedService } from 'src/app/_services';
import { combineLatest } from 'rxjs';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, PageChangeEvent, RowArgs, GridComponent } from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-wo-association-manage',
    templateUrl: './wo-association-manage.component.html',
    styleUrls: ['./wo-association-manage.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class WoAssociationsManageComponent implements OnInit {
    @Input() WoAssociationsManageWindow: boolean = false;
    @Output() WoAssociationsManageWindowEvent = new EventEmitter<boolean>();
    @Input() worksOrderData: any;

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
    title = 'Select Work Order Associations';


    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    loading = false;

    gridData: any;
    gridView: DataResult;
     public mySelection: number[] = [];
    public selectableSettings: SelectableSettings = {
         mode: 'multiple'
       };
   selectedRows  = [];
   ReasonAssociationWindow = false;
   AddAssociationWindow = false;
   reason = '';
   HeaderTitle ='';
   UpdateAssociationWindow = false;

        constructor(
            private worksOrdersService: WorksOrdersService,
            private alertService: AlertService,
            private chRef: ChangeDetectorRef,
            private sharedService: SharedService,
            private confirmationDialogService: ConfirmationDialogService,
        ) { }



        ngOnInit(): void {



          if(this.worksOrderData.hasOwnProperty('name'))
          {
            this.worksOrderData.woname = this.worksOrderData.name ;
          }


           this.GetWEBWorksOrdersAssociations();
        }

        ngOnDestroy() {
          this.subs.unsubscribe();
      }

      keyChange(e){

        this.selectedRows = e;
    //console.log('Selected items:', e)

    console.log(this.selectedRows);
    console.log(this.selectedRows[1]);

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
          dataItem
      }) {




//console.log('dataItem' + JSON.stringify(dataItem));

      }


      deleteAssociations() {


        $('.k-window').css({
            'z-index': 1000
        });


        this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
        .then((confirmed) => (confirmed) ? this.deleteAssociationsConfirmed(confirmed) : console.log(confirmed))
        .catch(() => console.log('User dismissed the dialog.'));
      }




         deleteAssociationsConfirmed(deleteConfirmed:boolean) {
           if (deleteConfirmed) {


             let params: any = {};


             params.WOSEQUENCE = this.worksOrderData.wosequence;
             params.iList = this.selectedRows;
             params.strUserId =this.currentUser.userId;




             this.worksOrdersService.DeleteAssociation(params)
             .subscribe(
               data => {
                 if (data.isSuccess) {
                   let deletionResult = data.data[0];
                   if (deletionResult.pRETURNSTATUS == "S") {
                       this.alertService.success("Deleted successfully.")
                       this.GetWEBWorksOrdersAssociations();
                     } else {
                       this.alertService.error(deletionResult.pRETURNMESSAGE);
                     }
                   }
               });
           }
         }







      updateAssociations() {

          this.HeaderTitle = 'Update Association';

          this.ReasonAssociationWindow = true;
          this.UpdateAssociationWindow = true;
          $('.woAssociationoverlay').addClass('ovrlay');
          // callApi = this.worksOrdersService.AddAssociation(params);

      }


      addAssociations() {

           this.HeaderTitle = 'Add Association';

          this.ReasonAssociationWindow = true;
          this.AddAssociationWindow = true;
          $('.woAssociationoverlay').addClass('ovrlay');

      }




AddAssociationSubmit(){

  let params: any = {};
  let callApi: any;



    params.WOSEQUENCE = this.worksOrderData.wosequence;
    params.iList = this.selectedRows;
    params.Reason = this.reason,
    params.strUserId =this.currentUser.userId;


    console.log('AddAssociationSubmit params  ' + JSON.stringify(params));

     callApi = this.worksOrdersService.AddAssociation(params);

     this.subs.add(
       callApi.subscribe(
         data => {


           if (data.isSuccess) {
             let responseResult = data.data[0];
             if (responseResult.pRETURNSTATUS == "S") {
                 this.alertService.success("Added successfully.")

                 this.ReasonAssociationWindow = true;
                 this.AddAssociationWindow = true;


                 this.GetWEBWorksOrdersAssociations();
               } else {
                 this.alertService.error(responseResult.pRETURNMESSAGE);
               }
             }



         }
       )
     )



}


UpdateAssociationSubmit(){

  let params: any = {};
  let callApi: any;

    this.HeaderTitle = 'Add Association';


    params.WOSEQUENCE = this.worksOrderData.wosequence;
    params.iList = this.selectedRows;
    params.Reason = this.reason,
    params.strUserId =this.currentUser.userId;


    console.log('UpdateAssociationSubmit params  ' + JSON.stringify(params));

     callApi = this.worksOrdersService.EditAssociation(params);


    this.subs.add(
      callApi.subscribe(
        data => {


          if (data.isSuccess) {
             let responseResult = data.data[0];
            if (responseResult.pRETURNSTATUS == "S") {
                this.alertService.success("Updated successfully.")
                this.ReasonAssociationWindow = true;
                this.UpdateAssociationWindow = true;
                this.GetWEBWorksOrdersAssociations();
              } else {
                   this.alertService.error(responseResult.pRETURNMESSAGE);
              }
            }



        }
      )
    )



}

closeAddUpdateAssociationWindow(){

  this.ReasonAssociationWindow = false;
  this.AddAssociationWindow = false;
  this.UpdateAssociationWindow = false;
  $('.woAssociationoverlay').removeClass('ovrlay');


}




       ActionApiCall(callApi){



       }



      closeWoAssociationsManageWindow() {
          this.WoAssociationsManageWindow = false;
          this.WoAssociationsManageWindowEvent.emit(this.WoAssociationsManageWindow);
      }


      GetWEBWorksOrdersAssociations() {


          const params = {
              "wosequence": this.worksOrderData.wosequence
          };

          const qs = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');



          this.subs.add(
              this.worksOrdersService.GetWEBWorksOrdersAssociations(qs).subscribe(
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







}
