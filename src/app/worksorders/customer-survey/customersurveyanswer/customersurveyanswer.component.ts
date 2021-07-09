import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-customersurveyanswer',
  templateUrl: './customersurveyanswer.component.html',
  styleUrls: ['./customersurveyanswer.component.css']
})
export class CustomersurveyanswerComponent implements OnInit {
  @Input() answerRecord;
  constructor() { }

  ngOnInit(): void {
   
  }

  setAnswer(numericAnswer : number) {
    this.answerRecord.woacsrnumericanswer = numericAnswer;

    switch(numericAnswer) { 
      case 1: { 
         this.answerRecord.woacsrtextualanswer = this.answerRecord.wocstquestionmultichoicE1TEXT;
         break; 
      } 
      case 2: { 
        this.answerRecord.woacsrtextualanswer = this.answerRecord.wocstquestionmultichoicE2TEXT;
         break; 
      } 
      case 3: { 
        this.answerRecord.woacsrtextualanswer = this.answerRecord.wocstquestionmultichoicE3TEXT;
         break; 
      } 
      case 4: { 
        this.answerRecord.woacsrtextualanswer = this.answerRecord.wocstquestionmultichoicE4TEXT;
         break; 
      } 
      case 5: { 
        this.answerRecord.woacsrtextualanswer = this.answerRecord.wocstquestionmultichoicE5TEXT;
         break; 
      } 
      default: { 
        this.answerRecord.woacsrtextualanswer = "";
         break; 
      } 
  }
}

}
