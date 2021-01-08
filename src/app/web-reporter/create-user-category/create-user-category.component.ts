import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SubSink } from 'subsink';
import { AlertService, WebReporterService } from '../../_services'

@Component({
  selector: 'app-create-user-category',
  templateUrl: './create-user-category.component.html',
  styleUrls: ['./create-user-category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateUserCategoryComponent implements OnInit {
  @ViewChild('userCategoryForm') form: any;
  subs = new SubSink();
  @Input() openCreateUserCategory: boolean = false;
  @Input() selectedUserCategory: any;
  @Output() closeCreateUserCategoryWindow = new EventEmitter<boolean>();
  @Output() refresSetCategoryWindow = new EventEmitter<boolean>();
  @Input() mode = 'new';
  title = 'Create User Category';
  submitted = false;
  categoryName: any;
  currentUser: any;

  constructor(
    private webReporterService: WebReporterService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.mode == 'edit') {
      this.title = 'Rename User Category';
      this.categoryName = this.selectedUserCategory.name;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeCreateUserCategory() {
    this.openCreateUserCategory = false;
    this.closeCreateUserCategoryWindow.emit(this.openCreateUserCategory);
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.valid) {
      let createUserCatService: any;
      if (this.mode == 'new') {
        createUserCatService = this.webReporterService.insertUserCategory(this.currentUser.userId, this.categoryName)
      } else {
        createUserCatService = this.webReporterService.renameUserCategory(this.currentUser.userId, this.selectedUserCategory.name, this.categoryName)
      }

      this.subs.add(
        this.webReporterService.checkIfUserCategoryExists(this.currentUser.userId, this.categoryName).subscribe(
          checkCatName => {
            if (checkCatName.isSuccess) {
              if (!checkCatName.data) {
                createUserCatService.subscribe(
                  data => {
                    if (data.isSuccess) {
                      this.closeCreateUserCategory();
                      this.refresSetCategoryWindow.emit(true);
                    } else this.alertService.error(data.message)
                  },
                  err => this.alertService.error(err)
                )
              } else this.alertService.error("User category already exist.");
            } else this.alertService.error(checkCatName.message);
          },
          error => this.alertService.error(error)
        )
      )

    }
  }

}
