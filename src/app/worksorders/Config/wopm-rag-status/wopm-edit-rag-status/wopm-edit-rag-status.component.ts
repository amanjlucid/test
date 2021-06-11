import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, WopmConfigurationService, ConfirmationDialogService } from '../../../../_services';
import { WopmRagstatusModel } from '../../../../_models'
declare var $: any;
import * as moment from 'moment';
import { SubSink } from 'subsink';
import { elementAt } from 'rxjs/operators';

@Component({
  selector: 'app-wopm-edit-rag-status',
  templateUrl: './wopm-edit-rag-status.component.html',
  styleUrls: ['./wopm-edit-rag-status.component.css']
})
export class WopmEditRagStatusComponent implements OnInit {

  subs = new SubSink();
  ragStatusForm: FormGroup;
  @Input() editFormWindow: boolean = false
  @Input() selectedRagStatus: WopmRagstatusModel
  @Input() editFormType: any
  @Input() compareToDates: any
  @Input() compareNumbers: any
  @Input() compareToNumbers: any
  @Input() surveyQuestions: any
  @Output() closeEditFormWindow = new EventEmitter<boolean>();
  wopmRagstatusModel: WopmRagstatusModel
  EditMode = false;
  TypeSelected = false;
  DisplayCompare = true;
  DisplayCompareTo = false;
  DisplaySurveyQuestion = false;
  DisplaySliders = false;
  DisplaySlidersButton = false;
  DisplayFinance = false;
  DisplayValues = false;
  DisplayDates = false;
  DisplayDecimal = false;
  loading = false;
  submitted = false;
  public windowTitle: string;
  currentUser;
  formErrors: any;
  compareList: any[];
  compareToList: any[];
  compareLabel: string = 'Compare this';
  compareToLabel: string = 'To this';
  infoLabel: string = '';
  SliderMin: number;
  SliderMax: number;
  TickWidth: number;
  SliderStep: number;
  formInvalid = false;
  public quesAnswer1 = ''
  public quesAnswer2 = ''
  public quesAnswer3 = ''
  public quesAnswer4 = ''
  public quesAnswer5 = ''


  constructor(
    private fb: FormBuilder,
    private wopmConfigurationService: WopmConfigurationService,
    private confirmationDialogService: ConfirmationDialogService,
    private alertService: AlertService,
  ) { }


  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.ragStatusForm = this.fb.group({
      compareName:  '',
      compareType:  '',
      rAGStatus:   '',
      compareField: '',
      compareToField:  '',
      greenMax: '0',
      amberMax: '0',
      decimalPlaces: 0,
    })
    this.SliderMin  = 0;
    this.SliderMax  = 100;
    this.SliderStep = 1;
    this.TickWidth= 5;

    this.populateTemplate(this.selectedRagStatus);
    if (this.editFormType == "new") {
      this.windowTitle = "New RAG Status";
    } else if (this.editFormType == "edit") {
      this.windowTitle = "Edit RAG Status";
      this.EditMode = true;
      this.changeType(this.selectedRagStatus.compareType)
    }

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  populateTemplate(ragStatus: WopmRagstatusModel = null) {

    this.ragStatusForm.patchValue({
      compareName: ragStatus.compareName ,
      compareType: ragStatus.compareType,
      rAGStatus:  ragStatus.rAGStatus,
      compareField: ragStatus.compareField,
      compareToField: ragStatus.compareToField,

    })

    if(ragStatus.compareType == 'Value')
    {
      this.ragStatusForm.patchValue({
         greenMax:  ragStatus.greenMaxDisplay,
         amberMax:  ragStatus.amberMaxDisplay,
      })
    }else{
      this.ragStatusForm.patchValue({
          greenMax: ragStatus.greenMax,
          amberMax: ragStatus.amberMax,
       })
    }
    if(ragStatus.compareType == 'Date')
    {
      this.ragStatusForm.patchValue({
        decimalPlaces: 0,
      })
    }else{
      this.ragStatusForm.patchValue({
        decimalPlaces: ragStatus.decimalPlaces,
       })
    }
  }

  changeMaxValue(value, control)
  {
    if (control =='green'){
      this.ragStatusForm.controls.greenMax.setValue(value)
    }else{
      this.ragStatusForm.controls.amberMax.setValue(value)
    }

  }

  changeType(value) {

    this.formErrorObject()
    this.TypeSelected = true;
    this.DisplayCompareTo = false;
    this.DisplaySliders = false;
    this.DisplayDates = false;
    this.DisplayFinance = false;
    this.DisplayValues = false;
    this.DisplayDecimal = false;
    this.DisplayCompare = true;
    this.compareLabel  = 'Compare this';
    this.compareToLabel  = 'To this';
    this.DisplaySlidersButton = false;
    if(value == '')
    {
      this.TypeSelected = false;
      return;
    }
    if(value == 'Percentage')
    {
      this.DisplayCompareTo = true;
      this.DisplayValues = true;
      this.DisplayDecimal = true;
      this.compareList = this.compareNumbers;
      this.compareToList = this.compareToNumbers;
      this.SliderMax = 100
      this.SliderMin = 0
      this.SliderStep = 1;
      this.TickWidth= 5;
      this.DisplaySlidersButton = this.EditMode;
      this.DisplaySliders  = !this.EditMode;
      this.infoLabel = `Use sliders below to select a percentage value between 0 and 100.  For a 'Percentage' RAG Status the Green value should be lower than the Amber value:`;
    }
    if(value == 'Value')
    {
      this.DisplayCompareTo = true;
      this.DisplayFinance = true;
      this.compareList = this.compareNumbers;
      this.compareToList = this.compareToNumbers;
      this.infoLabel = `Enter a value below for the Green and Amber maximum limit in £s.  For a 'Value' RAG Status the Green value should be higher than the Amber value:`;

    }
    if(value == 'Survey')
    {
      this.DisplayValues = true;
      this.DisplayDecimal = true;
      this.compareLabel = 'Survey Question'
      this.compareList = this.surveyQuestions;
      this.SliderMax = 5
      this.SliderMin = 0
      this.SliderStep = 1;
      this.TickWidth= 20;
      this.DisplaySlidersButton= this.EditMode;
      this.DisplaySurveyQuestion = this.EditMode;
      this.DisplaySliders  = !this.EditMode;
      this.updateSurveyQuestionText(this.ragStatusForm.controls.compareField.value);
      this.infoLabel = `Use sliders below to select a percentage value between 0 and 5.  For a 'Survey' RAG Status the Green value should be higher than the Amber value:`;


    }
    if(value == 'Date')
    {
      this.DisplayDates = true;
      this.DisplayCompare = false;
      this.DisplayCompareTo = true;
      this.compareToLabel  = 'Compare To Date';
      this.DisplayValues = true;
      this.compareToList = this.compareToDates;

      this.infoLabel = `Enter a value below for the Green and Amber maximum limit in days from Compare To Date.  For a 'Date' RAG Status the Green value should be higher than the Amber value:`;

    }

  }

  logValidationErrors(formData: WopmRagstatusModel): void {

    this.formInvalid = false;
    if(this.editFormType == 'new')
    {
      if(formData.compareName == undefined || formData.compareName == '')
      {
        this.formErrors.compareName = 'You must enter a name for the RAG Status definition!'
        this.formInvalid = true;
      }

      if(formData.compareType == undefined || formData.compareType == '')
      {
        this.formErrors.compareType = 'You must select a type for the RAG Status definition!'
        this.formInvalid = true;
      }
    }
    //Validate compare type

    if(formData.compareType != 'Date')
    {
      if(formData.compareField == undefined || formData.compareField == '')
      {
        if(formData.compareType == 'Survey'){
          this.formErrors.compareField = 'Please select a Survey Question!'
          this.formInvalid = true;
        }else{
          this.formErrors.compareField = 'Please select a data item to compare!'
          this.formInvalid = true;
        }
      }
    }

    //Validate compare to type

    if(formData.compareType != 'Survey')
    {
      if(formData.compareToField == undefined || formData.compareToField == '')
      {
        if(formData.compareType == 'Date'){
          this.formErrors.compareToField = 'Please select a Compare To Date!'
          this.formInvalid = true;
        }else{
          this.formErrors.compareToField = 'Please select a data item to compare to!'
          this.formInvalid = true;
        }
      }
    }

    //Validate green value
    if(formData.greenMax == 0){
      this.formErrors.greenMax = 'Please select an Green RAG Status Value!'
      this.formInvalid = true;
    }

    if(formData.greenMax < 0){
      this.formErrors.greenMax = 'Invalid Green RAG Status Value!'
      this.formInvalid = true;
    }

    //Validate amber value
    if(formData.amberMax == 0){
      this.formErrors.amberMax = 'Please select an Amber RAG Status Value!'
      this.formInvalid = true;
    }

    if(formData.amberMax < 0){
      this.formErrors.amberMax = 'Invalid Amber RAG Status Value!'
      this.formInvalid = true;
    }

    //Validate green and amber values
    if (formData.greenMax > 0 && formData.amberMax > 0){
      if(formData.compareType == 'Percentage'){
        if(formData.greenMax >= formData.amberMax ){
          this.formErrors.greenMax = 'Green Value should be less than the Amber Value!'
          this.formInvalid = true;
        }
      }else{
        if(formData.greenMax <= formData.amberMax ){
          this.formErrors.greenMax = 'Green Value should be greater than the Amber Value!'
          this.formInvalid = true;
        }
      }
    }

    //validate comparison fields
    if(formData.compareType == 'Percentage' || formData.compareType == 'Value'){
      if(formData.compareField != '' && formData.compareToField != ''){
        if(formData.compareField ==  formData.compareToField){
          this.formErrors.compareToField = 'The comparison field cannot be the same as the To this!'
          this.formInvalid = true;
        }
      }
    }

   }

  formErrorObject() {
    this.formErrors = {
      'compareName': '',
      'compareType': '',
      'compareField': '',
      'compareToField': '',
      'greenMax': '',
      'amberMax': '',
    }
  }

  updateSurveyQuestionText(value){

    if (value == '')
    {
      this.DisplaySurveyQuestion = false;
      return
    }

    let question = this.surveyQuestions[0] = this.surveyQuestions[0]
    this.surveyQuestions.forEach((ques) => {
      if(ques.questionNo == value)
      {
         question = ques
      }
    })
    let iMax = question.score5
    this.quesAnswer1 = question.answer1 + ': ' + question.score1.toString();
    this.quesAnswer2 = question.answer2 + ': ' + question.score2.toString();
    this.quesAnswer3 = question.answer3 + ': ' + question.score3.toString();
    this.quesAnswer4 = question.answer4 + ': ' + question.score4.toString();
    this.quesAnswer5 = question.answer5 + ': ' + question.score5.toString();
    this.DisplaySurveyQuestion = true;

  }

  get f() { return this.ragStatusForm.controls; }

  onSubmit() {
    this.submitted = true;
    let formRawVal = this.ragStatusForm.getRawValue();

    this.wopmRagstatusModel = new WopmRagstatusModel();
    if (this.editFormType == "new") {
      this.wopmRagstatusModel.newRecord = true;
      this.wopmRagstatusModel.rAGStatus = 'Inactive';
    } else {
      this.wopmRagstatusModel.newRecord = false;
      this.wopmRagstatusModel.rAGStatus = formRawVal.rAGStatus;
    }

    let greenVal = 0
    let amberVal = 0

    //do some jiggery pokery to get the green and amber values to be number values because some of these controls format them to strings
    if(isNaN(parseInt(formRawVal.greenMax)))
    {
      let gVal = formRawVal.greenMax.replace("£", "").replace(",", "").replace(",", "");
      greenVal = parseFloat(gVal);
    }
    else{
      greenVal = parseFloat(formRawVal.greenMax);
    }

    if(isNaN(parseInt(formRawVal.amberMax)))
    {
      let aVal = formRawVal.amberMax.replace("£", "").replace(",", "").replace(",", "");
      amberVal = parseFloat(aVal);
    } else{
      amberVal = parseFloat(formRawVal.amberMax);
    }

    this.wopmRagstatusModel.compareName = formRawVal.compareName;
    this.wopmRagstatusModel.compareType = formRawVal.compareType;
    this.wopmRagstatusModel.compareField = formRawVal.compareField;;
    this.wopmRagstatusModel.compareToField = formRawVal.compareToField;
    this.wopmRagstatusModel.greenMax = greenVal;
    this.wopmRagstatusModel.amberMax = amberVal;
    this.wopmRagstatusModel.decimalPlaces = formRawVal.decimalPlaces;
    this.wopmRagstatusModel.userID = this.currentUser.userId;

    this.formErrorObject();
    this.logValidationErrors(this.wopmRagstatusModel);

    if (this.formInvalid) {
      return;
    }

    this.wopmRagstatusModel.checkProcess = 'C';
    this.wopmConfigurationService.UpdateRAGStatus(this.wopmRagstatusModel)
    .subscribe(
      data => {
        if (data.isSuccess) {
          if (data.data == "E")
          {this.openConfirmationDialog(data.data, data.message)}
          else
          { this.completeUpdate(data.data)}

        } else {
          this.loading = false;
          this.alertService.error(data.message);
        }
      },
      error => {
        this.alertService.error(error);
        this.loading = false;
      });
    }

    public openConfirmationDialog(status, message) {
      this.confirmationDialogService.confirm('Please confirm..', message)
        .then((confirmed) => (confirmed) ? this.completeUpdate(status) : console.log(confirmed))
        .catch(() => console.log('Attribute dismissed the dialog.'));
      $('.k-window').css({ 'z-index': 1000 });
    }

    completeUpdate(status) {
      if(status=='S'){
        this.wopmRagstatusModel.checkProcess = 'P';
        this.wopmConfigurationService.UpdateRAGStatus(this.wopmRagstatusModel)
        .subscribe(
          data => {
            if (data.isSuccess) {
                this.alertService.success(data.message)
                this.closeEditFormWin();
                } else {
                  this.alertService.error(data.message);
                }
          });
      }
    }

   refreshForm() {
    this.ragStatusForm.reset();
  }

  changeDecimal()
  {

    let value = this.ragStatusForm.controls.decimalPlaces.value
    let gMax = parseFloat(this.ragStatusForm.controls.greenMax.value.toFixed(value));
    let aMax = parseFloat(this.ragStatusForm.controls.amberMax.value.toFixed(value));
    this.ragStatusForm.controls.greenMax.setValue(gMax)
    this.ragStatusForm.controls.amberMax.setValue(aMax)

  }

  closeEditFormWin() {
    this.editFormWindow = false;
    this.closeEditFormWindow.emit(this.editFormWindow)
  }

  displaySlidersForEdit(){
    this.DisplaySliders = !this.DisplaySliders;
  }

  numberKeyUp(val)  {

    if(this.f.compareType.value == 'Percentage')
    {
      if(val == 'green')
      {
        if(this.f.greenMax.value > 100)
        {
          this.f.greenMax.setValue(100);
        }
        if(this.f.greenMax.value < 0 || this.f.greenMax.value == null)
        {
          this.f.greenMax.setValue(0);
        }
      }
      else
      {
        if(this.f.amberMax.value > 100)
        {
          this.f.amberMax.setValue(100);
        }
        if(this.f.amberMax.value < 0 || this.f.amberMax.value == null)
        {
          this.f.amberMax.setValue(0);
        }
      }
    }
    if(this.f.compareType.value == 'Survey')
    {
      if(val == 'green')
      {
        if(this.f.greenMax.value > 5)
        {
          this.f.greenMax.setValue(5);
        }
        if(this.f.greenMax.value < 0 || this.f.greenMax.value == null)
        {
          this.f.greenMax.setValue(0);
        }
      }
      else
      {
        if(this.f.amberMax.value > 5)
        {
          this.f.amberMax.setValue(5);
        }
        if(this.f.amberMax.value < 0 || this.f.amberMax.value == null)
        {
          this.f.amberMax.setValue(0);
        }
      }
    }
    if(this.f.compareType.value == 'Date' )
    {
      if(val == 'green')
      {
        if(this.f.greenMax.value > 999999)
        {
          this.f.greenMax.setValue(999999);
        }
        if(this.f.greenMax.value < 0 || this.f.greenMax.value == null)
        {
          this.f.greenMax.setValue(0);
        }
      }
      else
      {
        if(this.f.amberMax.value > 999999)
        {
          this.f.amberMax.setValue(999999);
        }
        if(this.f.amberMax.value < 0 || this.f.amberMax.value == null)
        {
          this.f.amberMax.setValue(0);
        }
      }
    }
    if(this.f.compareType.value == 'Value')
    {
      if(val == 'green')
      {
        if(this.f.greenMax.value > 999999999.99)
        {
          this.f.greenMax.setValue(999999999.99);
        }
        if(this.f.greenMax.value < 0 || this.f.greenMax.value == null)
        {
          this.f.greenMax.setValue(0);
        }
      }
      else
      {
        if(this.f.amberMax.value > 999999999.99)
        {
          this.f.amberMax.setValue(999999999.99);
        }
        if(this.f.amberMax.value < 0 || this.f.amberMax.value == null)
        {
          this.f.amberMax.setValue(0);
        }
      }
    }

    this.changeDecimal()

  }
}
