import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AlertService, ConfirmationDialogService, WorksorderManagementService } from 'src/app/_services';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-worksorders-add-package-enter-quantity',
  templateUrl: './worksorders-add-package-enter-quantity.component.html',
  styleUrls: ['./worksorders-add-package-enter-quantity.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorksordersAddPackageEnterQuantityComponent implements OnInit {
  subs = new SubSink();
  @Input() packageQuantityWindow: any;
  @Input() mySelection: any;
  @Input() packageData: any;
  @Input() selectedWorkOrder: any;
  @Output() closePackageQuantiyEvent = new EventEmitter<boolean>();
  @Output() refreshPackageList = new EventEmitter<boolean>();
  title = 'Add Package Enter Quantity';
  readonly = true;
  displayHighestPkz: any;
  quantity: any = 0;
  costOverride = 0;
  comment = '';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  worksOrder: any;
  planYear: any;
  selectedPackages: any;
  applyCount = 0

  constructor(
    private chRef: ChangeDetectorRef,
    private alertService: AlertService,
    private worksorderManagementService: WorksorderManagementService,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    this.subs.add(
      forkJoin([
        this.worksorderManagementService.getWorksOrderByWOsequence(this.selectedWorkOrder.wosequence),
        this.worksorderManagementService.getPlanYear(this.selectedWorkOrder.wosequence)
      ]).subscribe(
        data => {
          this.worksOrder = data[0].data;
          this.planYear = data[1].data;

        }
      ))

    this.selectedPackages = this.packageData.filter(x => this.mySelection.includes(x.wphcode));

    this.displayHighestPkz = this.selectedPackages[this.selectedPackages.length - 1];
    this.applyCount = this.selectedPackages.length;

    // if (selectedPackage.length > 1) {
    //   let sortSelectedPkz = selectedPackage.sort(function (a, b) {
    //     return a.defaultcost - b.defaultcost
    //   })
    //   this.displayHighestPkz = sortSelectedPkz[sortSelectedPkz.length - 1];
    // } else {
    //   this.displayHighestPkz = selectedPackage[0];
    // }

  
    this.chRef.detectChanges();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closePackageQuantityWindow() {
    this.packageQuantityWindow = false;
    this.closePackageQuantiyEvent.emit(this.packageQuantityWindow);
    this.refreshPackageList.emit(true);
  }

  validate(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
  }

  setCost(event, field) {

    const checkDecimal = /^[-+]?[0-9]+\.[0-9]+$/;
    const checkDecimalVal = String(event).match(checkDecimal);

    if (checkDecimalVal != null && checkDecimalVal) {
      const deciLength = event.split(".")[1].length || 0;

      if (deciLength > 2 || isNaN(event)) {
        setTimeout(() => {
          this.quantity = event.slice(0, 8)
          this.chRef.detectChanges();
          return false;
        }, 5);
      } else if (deciLength <= 2 && event.split(".")[0].length > 5) {
        setTimeout(() => {
          this.quantity = event.slice(0, 5)
          this.chRef.detectChanges();
          return false;
        }, 5);
      }

    } else {
      if (this.quantity.length > 5) {
        const deciLength = event.includes(".");
        if (!deciLength) {
          setTimeout(() => {
            this.quantity = event.slice(0, 5)
            this.chRef.detectChanges();
            return false;
          }, 5);
        } else {

        }

      }
    }


    this.displayHighestPkz.cost = this.costOverride = this.quantity * this.displayHighestPkz.defaultcost;
    this.chRef.detectChanges();
  }

  defaultToOne() {
    this.quantity = 1;
    this.setCost(this.quantity, '');
    this.applyCost(1)
  }

  openConfirmationDialog(type, msg) {
    $('.k-window').css({ 'z-index': 1000 });
    this.confirmationDialogService.confirm('Please confirm..', `${msg}?`)
      .then((confirmed) => (confirmed) ? this.applyCost(type, true) : console.log(confirmed))
      .catch(() => console.log('Attribute dismissed the dialog.'));
  }


  applyCost(type, confirmed = false) {

    if (this.quantity == 0 && confirmed == false) {
      this.openConfirmationDialog(type, "Are you sure you want to add a zero quantity?");
      return
    }

    if (this.comment == "") {
      this.alertService.error("Comment must be entered.");
      return;
    }

    if (type == 1) {
      let params = {
        WLATAID: this.displayHighestPkz.ataid,
        WPHCODE: this.displayHighestPkz.wphcode,
        Quantity: this.quantity,
        ASSID: this.selectedWorkOrder.assid,
        UserId: this.currentUser.userId,
        Cost: this.costOverride,
        CTTSURCDE: this.worksOrder.cttsurcde,
        Comment: this.comment,
        WPRSEQUENCE: this.worksOrder.wprsequence,
        WOSEQUENCE: this.worksOrder.wosequence,
        WOPSEQUENCE: this.worksOrder.wopsequence
      }

      if (this.applyCount > 0) {

        this.subs.add(
          this.worksorderManagementService.worksOrdersInsertIntoWorkList(params).subscribe(
            data => {
              if (data.isSuccess == false) {
                this.alertService.error(data.message)
                return
              }

              this.applyCount--
              this.displayHighestPkz = this.selectedPackages[this.applyCount - 1];
              this.quantity = 0;
              this.comment = '';

              if (this.applyCount == 0) {
                this.closePackageQuantityWindow();
                return
              }

            }
          )
        )
      }

    } else {
      let req: any = [];
      for (let pkz of this.selectedPackages) {
        let params = {
          WLATAID: pkz.ataid,
          WPHCODE: pkz.wphcode,
          Quantity: this.quantity,
          ASSID: this.selectedWorkOrder.assid,
          UserId: this.currentUser.userId,
          Cost: this.costOverride,
          CTTSURCDE: this.worksOrder.cttsurcde,
          Comment: this.comment,
          WPRSEQUENCE: this.worksOrder.wprsequence,
          WOSEQUENCE: this.worksOrder.wosequence,
          WOPSEQUENCE: this.worksOrder.wopsequence
        }

        req.push(this.worksorderManagementService.worksOrdersInsertIntoWorkList(params))
      }

      this.subs.add(
        forkJoin(req).subscribe(
          data => {
            this.closePackageQuantityWindow();
          }
        )
      )

    }
  }

}
