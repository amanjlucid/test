import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SpellCheckerService } from 'ngx-spellchecker';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-spell-checker',
  templateUrl: './spell-checker.component.html',
  styleUrls: ['./spell-checker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpellCheckerComponent implements OnInit {
  @Input() openSpellChecker: boolean = false;
  @Input() textId: any;
  @Input() textString: any;
  @Output() closeSpellChecker = new EventEmitter<boolean>();
  @Output() textStringReturn = new EventEmitter<any>();
  title = "Spelling checking"
  changeTo: any;
  wordSuggestion: any = [];
  @Input() isCompleted: boolean = false
  width = 400;
  ignoreAll: boolean = false;
  dictionary: any;
  splitString: any;
  wrongWordIndex: any;
  skipInd: any = [];

  constructor(
    private spellCheckerService: SpellCheckerService,
    private httpClient: HttpClient,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    // console.log(this.textId)
    // console.log(this.textString)
    // console.log(this.textId)
    if (isNaN(this.textString)) {
      this.width = 990
      this.httpClient.get('assets/normalized_en-US.dic.txt', { responseType: 'text' }).subscribe((res: any) => {
        // console.log(res);
        this.spellCheckerService.normalizeDictionary(res).then((dic) => {
          this.dictionary = this.spellCheckerService.getDictionary(dic);
          // console.log(dictionary.spellCheck('test'))
          if (this.textString != "") {
            this.findAndHighlight();
          }

        });



      });
    } else {
      // console.log("ïs number");
      this.width = 400
      this.isCompleted = true;
      this.chRef.detectChanges();

    }

  }

  closeSpellCheckerMethod() {
    this.openSpellChecker = false;
    this.closeSpellChecker.emit(this.openSpellChecker)
  }

  findAndHighlight() {
    this.splitString = this.textString.split(" ");
    for (const ind in this.splitString) {
      if (isNaN(this.splitString[ind])) {
        this.splitString[ind] = this.splitString[ind].replace('.', '');
        if (!this.dictionary.spellCheck(this.splitString[ind])) {
          this.wrongWordIndex = ind;
          //console.log(this.wrongWordIndex)
          this.wordSuggestion = this.dictionary.checkAndSuggest(this.splitString[ind]).suggestions
          break;
        }
      }
    }
    // console.log(this.wordSuggestion)
    // console.log(this.splitString[this.wrongWordIndex])
    this.highlight(this.splitString[this.wrongWordIndex])
    this.chRef.detectChanges();
  }

  // highlight(word) {
  //   return this.textString.replace(new RegExp(word, "gi"), match => {

  //     return '<span class="highlightText">' + match + '</span>';
  //   });
  // }

  highlight(text) {
    let inputText = document.getElementById("spellingToCheck");
    let innerHTML = inputText.innerHTML;
    let index = innerHTML.indexOf(text);
    if (index >= 0) {
      innerHTML = innerHTML.substring(0, index) + "<span class='highlight' style='background-color: yellow'>" + innerHTML.substring(index, index + text.length) + "</span>" + innerHTML.substring(index + text.length);
      inputText.innerHTML = innerHTML;
    }
    this.chRef.detectChanges();
  }

  selecteSuggestion(sugg) {
    this.changeTo = sugg;
    this.chRef.detectChanges();
  }

  ignoreAllMethod() {
    this.ignoreAll = true
    this.changeTo = "";
    this.skipInd = [];
  }

  changeString() {
    if (this.changeTo != "" && this.wordSuggestion.length > 0) {
      this.textString = this.textString.replace(this.splitString[this.wrongWordIndex], this.changeTo);
      $("#spellingToCheck").html("");
      $("#spellingToCheck").text(this.textString);
      //console.log(this.textString)
      this.chRef.detectChanges();
      this.findAndHighlight();
    }
  }

  skipIndMethod() {
    if (!this.skipInd.includes(this.wrongWordIndex)) {
      this.skipInd.push(this.wrongWordIndex)
    }
    $("#spellingToCheck").html("");
    $("#spellingToCheck").text(this.textString);
    setTimeout(() => {
      this.nextAndPrev(true)
    }, 100);

  }

  nextAndPrev(skip = false) {
    this.splitString = this.textString.split(" ");
    if (skip) {
      for (const ind in this.splitString) {
        if (isNaN(this.splitString[ind])) {
          if (!this.skipInd.includes(ind)) {
            this.splitString[ind] = this.splitString[ind].replace('.', '');
            if (!this.dictionary.spellCheck(this.splitString[ind])) {
              this.wrongWordIndex = ind;
              this.wordSuggestion = this.dictionary.checkAndSuggest(this.splitString[ind]).suggestions
              break;
            }
          }
        }
      }
    }

    // console.log(this.wordSuggestion)
    // console.log(this.splitString[this.wrongWordIndex])
    this.highlight(this.splitString[this.wrongWordIndex])
    this.chRef.detectChanges();
  }

  returnString() {
    this.textStringReturn.emit(this.textString);
    this.closeSpellCheckerMethod()
  }


}
