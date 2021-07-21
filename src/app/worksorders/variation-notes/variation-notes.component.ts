import { Component, OnInit, OnDestroy, Input, Output,ChangeDetectorRef, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, EventManagerService, HelperService, ConfirmationDialogService, SharedService, WorksorderManagementService} from '../../_services'
import { GroupDescriptor, DataResult, process, State, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { combineLatest } from 'rxjs';
import { SubSink } from 'subsink';
@Component({
  selector: 'app-variation-notes',
  templateUrl: './variation-notes.component.html',
  styleUrls: ['./variation-notes.component.css']
})
export class VariationNotesComponent implements OnInit {
  @Input() displayNotesWindow: boolean = false;
  @Input() wosequence: number = 0;
  @Input() woisequence: number = 0;
  @Input() disabledAddNote: boolean = false;
  @Output() closeVariationNotes = new EventEmitter<boolean>();
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
  windowTitle: string;
  submitted = false;
  noteError: string = ""
  dataDetails: any;
  dataDetailsTemp: any

  public gridView: DataResult;
  notesForm: FormGroup;

  allowUnsort = true;
  multiple = false;

  worksOrderAccess = [];
  worksOrderUsrAccess: any = [];
  userType: any = [];

  public mode: any = 'single';
  currentUser: any;
  loading = true

  constructor(
    private chRef: ChangeDetectorRef,
    private wopmConfigurationService: WorksorderManagementService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private sharedService: SharedService,
    private helper: HelperService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.helper.updateNotificationOnTop();
    this.windowTitle = "Variation Notes"
    this.notesForm = this.fb.group({
      newNote: ['', [Validators.required]],
    })

    this.subs.add(
      combineLatest([
        this.sharedService.woUserSecObs,
        this.sharedService.worksOrdersAccess,
        this.sharedService.userTypeObs
      ]).subscribe(
        data => {
          // console.log(data);
          this.worksOrderUsrAccess = data[0];
          this.worksOrderAccess = data[1];
          this.userType = data[2][0];
        }
      )
    )

    this.getGridDataDetails('',false);

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getGridDataDetails(Note: string, AddNew: boolean) {

    let params: any = {};
    params.WOSEQUENCE = this.wosequence;
    params.WOISEQUENCE = this.woisequence;
    params.UserID = this.currentUser.userId;
    params.AddNew = AddNew;
    params.Note = Note;

    this.subs.add(
      this.wopmConfigurationService.AddGetVariationNote(params).subscribe(
        data => {
          if (data.isSuccess) {
            const notes = data.data;
            this.dataDetails = notes;
            this.dataDetailsTemp = Object.assign([], notes);
            this.gridView = process(this.dataDetailsTemp, this.state);
            this.loading = false;
            this.chRef.detectChanges();
          }
        }
      )
    )
  }

  checkWorksOrdersAccess(val: string): Boolean {
     if (this.worksOrderUsrAccess != undefined) {
    return this.worksOrderUsrAccess.includes(val);
    } else {
      return false;
    }
  }

  distinctPrimitive(fieldName: string): any {
    return distinct(this.dataDetails, fieldName).map(item => {
      return { val: item[fieldName], text: item[fieldName] }
    });
  }

  closeNotesWindow()
  {
    this.displayNotesWindow = false;
    this.closeVariationNotes.emit(false)
  }

  onSubmit() {
    this.submitted = true;
    if (this.Validate())
    {
        let Note = this.notesForm.controls.newNote.value;
        this.getGridDataDetails(Note, true);
    }
  }


  Validate()
  {
    if(this.notesForm.controls.newNote.value  == "")
    {
      this.noteError = "A new note is required";
      return false;
    }
    else
    {
      this.noteError = "";
      return true;
    }
  }
}
