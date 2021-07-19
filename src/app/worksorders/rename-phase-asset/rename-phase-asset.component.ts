import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-rename-phase-asset',
  templateUrl: './rename-phase-asset.component.html',
  styleUrls: ['./rename-phase-asset.component.css']
})
export class RenamePhaseAssetComponent implements OnInit {
  subs = new SubSink();
  @Input() renameAssetWindow: boolean = false
  @Input() rename: any
  @Output() closeRenameAssetWindow = new EventEmitter<boolean>();
  @Output() renameItem = new EventEmitter<any>();
  windowTitle: string;
  submitted = false;
  descriptionError: string = ""
  renameForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {

    this.windowTitle = "Rename Phase Asset"
    this.renameForm = this.fb.group({
      newName: ['', [Validators.required]],
    })
    this.renameForm.controls.newName.setValue(this.rename.NewPhaseAssetName)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeEditFormWindow()
  {
    this.renameAssetWindow = false;
    this.closeRenameAssetWindow.emit(false)
  }

  onSubmit() {
    this.submitted = true;
    if (this.Validate())
    {
      this.rename.NewPhaseAssetName = this.renameForm.controls.newName.value
      this.rename.strCheckOrProcess = "C"
      this.closeRenameAssetWindow.emit(true)
      this.renameItem.emit(this.rename)
    }
  }


  Validate()
  {
    if(this.renameForm.controls.newName.value  == "")
    {
      this.descriptionError = "A new name is required";
      return false;
    }
    else
    {
      this.descriptionError = "";
      return true;
    }
  }
}
