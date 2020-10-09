import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TreeItemDropEvent, DropPosition, TreeItemLookup, DropAction } from '@progress/kendo-angular-treeview';
import { HnsPortalService, AlertService, ConfirmationDialogService, SharedService } from 'src/app/_services';
import { SubSink } from 'subsink';
import { interval, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-hns-definition-detail',
  templateUrl: './hns-definition-detail.component.html',
  styleUrls: ['./hns-definition-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnsDefinitionDetailComponent implements OnInit, OnDestroy {
  @ViewChild('treeview')
  public treeview;

  @Input() definitionDetailIsTrue: boolean = false;
  @Output() closeDefinitionDetailEven = new EventEmitter<boolean>();
  @Input() selectedDefinition: any;
  keys: string[] = [];
  subs = new SubSink();
  definitionDetails: any = [];
  treeMenuItems: any[] = ['New Group', 'Change Group', 'Delete Group', 'New Heading'];
  expandedKeys: any[] = [];
  isOpenNewGrpDialog: boolean = false;
  isCreateNewGrp: boolean = false;
  defGrpFormMode: string = "new";
  selectedNode: any;
  grpSq: string = "";
  HeadSq: string = "";
  QuesSq: string = "";
  isOpenDefHeading: boolean = false;
  isQuestionOpen: boolean = false;
  disableActins: boolean = false;
  title: string = "";
  nodeMap: any;
  templateIssueOpen: boolean = false;
  templateActionOpen: boolean = false;
  scoringRulesOpen: boolean = false;
  touchtime = 0;
  showSimpleContextMenu = false;
  clickEvent: any;
  hnsPermission: any = [];
  currentUser: any;

  constructor(
    private hnsPortalService: HnsPortalService,
    private alertService: AlertService,
    private confirmationDialogService: ConfirmationDialogService,
    private chRef: ChangeDetectorRef,
    private sharedService: SharedService

  ) { }

  isOfType = (fileName: string, typeArr: any, hasrepeatable: string) => typeArr.indexOf(fileName) !== -1 && (hasrepeatable == "N" || hasrepeatable == undefined || hasrepeatable == " ");
  isOfTpeGroup = (fileName: string, typeArr: any, hasrepeatable: string) => typeArr.indexOf(fileName) !== -1 && hasrepeatable == "Y";

  public isExpanded = (dataItem: any, index: string) => {
    return this.keys.indexOf(index) > -1;
  }

  /**
   * A `collapse` event handler that will remove the node hierarchical index
   * from the collection, collapsing its children.
   */
  public handleCollapse(node) {
    this.keys = this.keys.filter(k => k !== node.index);
  }

  /**
   * An `expand` event handler that will add the node hierarchical index
   * to the collection, expanding the its children.
   */
  public handleExpand(node) {
    this.keys = this.keys.concat(node.index);
  }

  ngOnInit() {
    
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.selectedDefinition.hasinuse == "Y") {
      this.disableActins = true;
      this.title = "Health and Safety Definition Detail - (In Use - Read Only)"
    } else {
      this.disableActins = false;
      this.title = "Health and Safety Definition Detail";
    }
    this.getDefinitionDetail(this.selectedDefinition);

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  ngAfterViewChecked() {
    this.chRef.detectChanges();
  }

  closeDefinitionDetail() {
    this.subs.add(
      this.hnsPortalService.HASDefinitionValidationResult(this.selectedDefinition.hascode, this.selectedDefinition.hasversion).subscribe(
        data => {
          // emit false to close the definition panel 
          this.definitionDetailIsTrue = false;
          this.closeDefinitionDetailEven.emit(this.definitionDetailIsTrue);
        },
        error => {
          this.alertService.error(error);
        }
      )
    )


  }

  log(event: string, args?: any): void {
    //console.log(event, args);
  }

  handleDrop(event: TreeItemDropEvent): void {
    if (this.selectedDefinition != undefined) {
      if (this.selectedDefinition.hasinuse == "Y") {
        event.setValid(false);
        return
      }
    }
    //console.log(event);
    const source = event.sourceItem.item.dataItem;
    const destinaton = event.destinationItem.item.dataItem;

    //prevent drop if attempting to add file if not same type
    if (destinaton.elType != source.elType && ((source.elType == "group" && destinaton.elType == "heading") || (source.elType == "group" && destinaton.elType == "ques") || (source.elType == "heading" && destinaton.elType == "ques") || (source.elType == "ques" && destinaton.elType == "group") || (source.elType == "heading" && event.destinationItem.parent == null && event.dropPosition !== DropPosition.Over) || (source.elType == "ques" && event.destinationItem.parent == null) || ((source.elType == "ques" && destinaton.elType == "heading") && (event.dropPosition !== DropPosition.Over)))) {
      event.setValid(false);
      return
    }

    // prevent drop if attempting to add to in same type and drop over
    if ((destinaton.elType == source.elType) && event.dropPosition === DropPosition.Over) {
      event.setValid(false);
      return
    }

    this.changeNode(event);
  }

  getActionText(action: DropAction, destinationItem: TreeItemLookup, sourceItem: TreeItemLookup): string {
    if (sourceItem != undefined) {
      if (destinationItem && action === DropAction.Add && (destinationItem.item.dataItem.elType == sourceItem.item.dataItem.elType)) {
        return 'Invalid';
      }
    }
    switch (action) {
      case DropAction.Add: return 'Add';
      case DropAction.InsertTop: return 'InsertTop';
      case DropAction.InsertMiddle: return 'InsertMiddle';
      case DropAction.InsertBottom: return 'InsertBottom';
      case DropAction.Invalid:
      default: return 'Invalid';
    }
  }

  nodeClick(e) {
    e.preventDefault();

    const element = e.toElement;
    const elClassName = e.toElement.className;
    if ($('.k-treeview-lines li').length > 0 && elClassName != "kendoTreeM") {
      if (elClassName.includes('k-mid')) {
        const spanEl = element.getElementsByClassName("k-in")[0];
        let ev3 = new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: false,
          view: window,
          button: 2,
          buttons: 0,
          clientX: spanEl.getBoundingClientRect().x,
          clientY: spanEl.getBoundingClientRect().y
        });
        spanEl.dispatchEvent(ev3);

      } else if (elClassName.includes('k-item')) {

      }
    } else {
      if ((e.type == "contextmenu")) {
        this.treeMenuItems = ['New Group'];
        this.showSimpleContextMenu = true
        this.clickEvent = e;
      }
    }

  }

  hideContextMenu(ev) {
    this.showSimpleContextMenu = ev;
  }

  onNodeClick(e: any): void {
    let grpMenu, headMenu, quesMenu = [];
    let scoringRule = [];
    if (this.disableActins) {
      grpMenu = ['View Group'];
      headMenu = ['View Heading'];

      if (this.hnsPermission.indexOf("Edit Scoring Rule") !== -1) {
        scoringRule = ['Edit Scoring Rules'];
      }
      quesMenu = [...['View Question', 'Edit Template Issues', 'Edit Template Actions'], ...scoringRule];

    } else {
      let grp, ques, head = [];
      let cmnQuesMenu = ['Change Question', 'Delete Question', 'Edit Template Issues', 'Edit Template Actions']

      if (this.hnsPermission.indexOf("Add Group") !== -1) {
        grp = ["New Group"];
      }
      if (this.hnsPermission.indexOf("Add Header") !== -1) {
        head = ["New Heading"];
      }

      if (this.hnsPermission.indexOf("Add Question") !== -1) {
        ques = ["New Question"];
      }


      if (this.hnsPermission.indexOf("Edit Scoring Rule") !== -1 || this.currentUser.admin == "Y") {
        scoringRule = ['Edit Scoring Rules'];
        cmnQuesMenu = ['Change Question', 'Delete Question', 'Edit Template Issues', 'Edit Scoring Rules', 'Edit Template Actions']
      }


      grpMenu = [].concat(grp, ['Change Group', 'Delete Group'], head)
      headMenu = [...head, ...['Change Heading', 'Delete Heading'], ...ques];
      quesMenu = [].concat(ques, cmnQuesMenu)

      grpMenu = grpMenu.filter(x => {
        return x != undefined;
      })
      headMenu = headMenu.filter(x => {
        return x != undefined;
      })
      quesMenu = quesMenu.filter(x => {
        return x != undefined;
      })

    }


    const nodeMap = this.treeview.treeViewLookupService.map.get(e.item.index);
    let readOnlyWindow = "";

    let disableDoubleClick = false;
    //if (e.type === 'contextmenu') {
    if (e.item.dataItem.elType == "group") {
      if (grpMenu.indexOf("View Group") !== -1) {
        readOnlyWindow = "View Group";
      } else if (grpMenu.indexOf("Change Group") !== -1) {
        readOnlyWindow = "Change Group";
      } else {
        disableDoubleClick = true
      }

      this.treeMenuItems = grpMenu;
      this.nodeMap = {
        parentGroup: nodeMap.item.dataItem.hasgroupname,
        grpRepeatable: nodeMap.item.dataItem.hasrepeatable
      }
    } else if (e.item.dataItem.elType == "heading") {
      if (headMenu.indexOf("View Heading") !== -1) {
        readOnlyWindow = "View Heading";
      } else if (headMenu.indexOf("Change Heading") !== -1) {
        readOnlyWindow = "Change Heading";
      } else {
        disableDoubleClick = true
      }

      this.treeMenuItems = headMenu;
      this.nodeMap = {
        parentGroup: nodeMap.parent.item.dataItem.hasgroupname,
        parentHeading: nodeMap.item.dataItem.hasheadingname,
        grpRepeatable: nodeMap.parent.item.dataItem.hasrepeatable
      }
    } else if (e.item.dataItem.elType == "ques") {
      if (quesMenu.indexOf("View Question") !== -1) {
        readOnlyWindow = "View Question";
      } else if (quesMenu.indexOf("Change Question") !== -1) {
        readOnlyWindow = "Change Question";
      } else {
        disableDoubleClick = true
      }

      this.treeMenuItems = quesMenu;
      this.nodeMap = {
        parentGroup: nodeMap.parent.parent.item.dataItem.hasgroupname,
        parentHeading: nodeMap.parent.item.dataItem.hasheadingname,
        grpRepeatable: nodeMap.parent.parent.item.dataItem.hasrepeatable
      }
    }
    //}



    if (e.type !== 'contextmenu' && !disableDoubleClick) {
      this.doubleClickHandler(readOnlyWindow, e.item.dataItem)
    }


  }

  doubleClickHandler(item, dataItem) {
    if (this.touchtime == 0) {
      // set first click
      this.touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - this.touchtime) < 400) {
        this.onSelect({ item, dataItem })
        this.touchtime = 0;
      } else {
        // not a double click so set as a new first click
        this.touchtime = new Date().getTime();
      }
    }
  }

  onSelect({ item, dataItem }): void {
    this.selectedNode = dataItem;
    // console.log(this.selectedNode);
    // console.log(item);
    if (item == "New Group" && dataItem == undefined) {
      this.defGrpFormMode = "new";
      this.createNewDefGrp();
      return
    }

    if (item == "New Group" && dataItem.elType == "group") {
      this.defGrpFormMode = "new";
      this.createNewDefGrp();
    } else if (item == "Change Group" && dataItem.elType == "group") {
      this.defGrpFormMode = "change";
      this.createNewDefGrp();
    } else if (item == "View Group" && dataItem.elType == "group") {
      this.defGrpFormMode = "view";
      this.createNewDefGrp();
    } else if (item == "Delete Group" && dataItem.elType == "group") {
      this.openConfirmationDialog({ HasCode: dataItem.hascode, HasVersion: dataItem.hasversion, HASGROUPID: dataItem.hasgroupid }, "group")
    } else if ((item == "New Heading" && dataItem.elType == "heading") || item == "New Heading" && dataItem.elType == "group") {
      this.defGrpFormMode = "new";
      this.openHeadingForm();
    } else if (item == "Change Heading" && dataItem.elType == "heading") {
      this.defGrpFormMode = "change"
      this.openHeadingForm();
    } else if (item == "View Heading" && dataItem.elType == "heading") {
      this.defGrpFormMode = "view"
      this.openHeadingForm();
    } else if (item == "Delete Heading" && dataItem.elType == "heading") {
      this.openConfirmationDialog({ HASCODE: dataItem.hascode, HASVERSION: dataItem.hasversion, HASGROUPID: dataItem.hasgroupid, HASHEADINGID: dataItem.hasheadingid }, "heading")
    } else if (item == "New Question" && dataItem.elType == "ques") {
      this.defGrpFormMode = "new"
      this.openQuestionForm();
    } else if (item == "Change Question" && dataItem.elType == "ques") {
      this.defGrpFormMode = "change"
      this.openQuestionForm();
    } else if (item == "View Question" && dataItem.elType == "ques") {
      this.defGrpFormMode = "view"
      this.openQuestionForm();
    } else if (item == "New Question" && dataItem.elType == "heading") {
      this.defGrpFormMode = "new"
      this.openQuestionForm();
    } else if (item == "Delete Question" && dataItem.elType == "ques") {
      this.openConfirmationDialog({ hascode: dataItem.hascode, hasversion: dataItem.hasversion, hasgroupid: dataItem.hasgroupid, hasheadingid: dataItem.hasheadingid, hasquestionid: dataItem.hasquestionid }, "ques");
    } else if (item == "Edit Template Issues" && dataItem.elType == "ques") {
      this.openTemplateIssue();
    } else if (item == "Edit Template Actions" && dataItem.elType == "ques") {
      this.openTemplateAction();
    } else if (item == "Edit Scoring Rules" && dataItem.elType == "ques") {
      this.openEditScoringrules();
    }
  }

  getDefinitionDetail(selectedDefinition) {
    this.expandedKeys = []; // reset expanded keys
    this.subs.add(
      this.hnsPortalService.getDefinitionDetail(selectedDefinition).subscribe(
        data => {
          if (data.isSuccess) {
            let tempData = data.data;
            if (tempData.length > 0) {
              this.definitionDetails = this.callBackFunction(tempData);
              //console.log(this.definitionDetails);
            } else {
              this.definitionDetails = [];
              this.isOpenNewGrpDialog = true;
              $('.detailvieBlur').addClass('ovrlay');
              //this.alertService.error(data.message);
            }
          }
        }
      )
    )
  }

  callBackFunction(arr) {
    arr.forEach(element => {
      if (element['hasgroupname'] != undefined) {
        element.text = element.hasgroupname;
        element.elType = 'group';
        this.grpSq = element.hasgroupseq;
        element.sqstr = this.grpSq;
      }

      if (element['hasheadingname'] != undefined) {
        element.text = element.hasheadingname;
        element.elType = 'heading';
        this.HeadSq = element.hasheadingseq;
        element.sqstr = `${this.grpSq}.${this.HeadSq}`

      }

      if (element['hasquestiontext'] != undefined) {
        element.text = element.hasquestiontext;
        element.elType = 'ques';
        this.QuesSq = element.hasquestionseq;
        element.sqstr = `${this.grpSq}.${this.HeadSq}.${this.QuesSq}`

      }

      element.id = element.hasgroupid + element.text.replace(/ /g, '') + this.grpSq + this.HeadSq + this.QuesSq;
      if (element['hasgroupname'] != undefined) {
        this.expandedKeys.push(element.text); // expand group
      }

      if (element.healthSafetyHeadingViewModels != undefined && element.healthSafetyHeadingViewModels.length > 0) {
        element.items = element.healthSafetyHeadingViewModels;
        delete element['healthSafetyHeadingViewModels'];
        this.callBackFunction(element.items);
      }

      if (element.healthSafetyQuestionViewModels != undefined && element.healthSafetyQuestionViewModels.length > 0) {
        element.items = element.healthSafetyQuestionViewModels;
        delete element['healthSafetyQuestionViewModels'];
        this.callBackFunction(element.items);
      }
    });
    return arr;
  }


  changeNode(event) {
    const source = event.sourceItem.item.dataItem;
    const destinaton = event.destinationItem.item.dataItem;
    const sourceItem = event.destinationItem;
    const destinationItem = event.sourceItem;
    //console.log({ev:event, des: destinationItem, sor : sourceItem})
    let formObj: any = {};
    formObj.HASCODE = source.hascode;
    formObj.HASVERSION = source.hasversion;
    formObj.HASGROUPID = source.hasgroupid;
    formObj.movedirection = event.dropPosition == 1 ? true : false
    let apiToCall = "";

    if (source.elType == "ques") {
      formObj.HASHEADINGID = source.hasheadingid;
      formObj.DestinationQuestionSequence = destinaton.hasquestionseq;
      formObj.HASQUESTIONID = source.hasquestionid;

      if (JSON.stringify(destinationItem.parent.item.dataItem) == JSON.stringify(sourceItem.parent.item.dataItem)) {
        apiToCall = "quesSeq";
      } else if ((source.elType == "ques" && destinaton.elType == "heading") || ((source.elType == "ques" && destinaton.elType == "ques") && (JSON.stringify(destinationItem.parent.item.dataItem) != JSON.stringify(sourceItem.parent.item.dataItem)))) {
        formObj.DestinationGroupId = destinaton.hasgroupid;
        formObj.DestinationHeadingId = destinaton.hasheadingid;
        apiToCall = "quesHead";
      }

    } else if (source.elType == "heading") {
      formObj.HASHEADINGID = source.hasheadingid;
      formObj.DESTINATIONHEADINGSEQ = destinaton.hasheadingseq;
      if (JSON.stringify(destinationItem.parent.item.dataItem) == JSON.stringify(sourceItem.parent.item.dataItem)) {
        apiToCall = "headSeq";
      } else if ((source.elType == "heading" && destinaton.elType == "group") || ((source.elType == "heading" && destinaton.elType == "heading") && (JSON.stringify(destinationItem.parent.item.dataItem) != JSON.stringify(sourceItem.parent.item.dataItem)))) {
        formObj.DESTINATIONGROUPID = destinaton.hasgroupid;
        apiToCall = "headGrp";
      }

    } else if (source.elType == "group" && destinaton.elType == "group") {
      formObj.hasgroupseq = destinaton.hasgroupseq;
      apiToCall = "grpSeq";
    }

    // console.log(formObj);

    if (apiToCall != "") {
      this.hnsPortalService.moveNodes(apiToCall, formObj).subscribe(
        data => {
          // console.log(data);
          if (!data.isSuccess) {
            this.alertService.error(data.message)
          } else {
            this.getDefinitionDetail(this.selectedDefinition);
          }
        }
      )
    }

  }

  public openConfirmationDialog(obj: any, deleteType) {
    // this.chRef.markForCheck();
    if (this.selectedNode != undefined) {
      setTimeout(() => {
        this.chRef.detach();
        this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to delete this record ?')
          .then((confirmed) => (confirmed) ? this.delete(obj, deleteType) : console.log(confirmed))
          .catch(() => console.log('Attribute dismissed the dialog.'));
        $('.k-window').css({ 'z-index': 1000 });

        const source = interval(1000);
        const timer$ = timer(15000);
        const subscribe = source.pipe(takeUntil(timer$));
        this.subs.add(
          subscribe.subscribe(
            sec => {
              this.chRef.detectChanges();
              if (sec == 5) {
                this.chRef.reattach();
              }
            })
        )
      }, 200);
    }
  }

  delete(defObj: any, deleteType: string) {
    let deleteQuery: any;
    if (deleteType == "group") {
      deleteQuery = this.hnsPortalService.deleteDefinitionGrp(defObj);
    } else if (deleteType == "heading") {
      deleteQuery = this.hnsPortalService.deleteDefinitionHeading(defObj);
    } else if (deleteType == "ques") {
      deleteQuery = this.hnsPortalService.deleteQuestion(defObj);
    }

    this.subs.add(
      deleteQuery.subscribe(
        data => {
          if (data.isSuccess) {
            this.getDefinitionDetail(this.selectedDefinition);
          } else {
            this.alertService.error(data.message);
          }
        },
        (error) => {
          this.alertService.error(error);
        }
      )
    )
  }



  closeDialog(status: any) {
    this.isOpenNewGrpDialog = false;
    $('.detailvieBlur').removeClass('ovrlay');
    if (status == "yes") {
      if (!this.disableActins) {
        this.createNewDefGrp();
      } else {
        alert("Read only record");
      }
    }
  }

  createNewDefGrp() {
    this.isCreateNewGrp = true;
    $('.detailvieBlur').addClass('ovrlay');
  }

  closeDefGrp($event: boolean) {
    this.isCreateNewGrp = $event;
    $('.detailvieBlur').removeClass('ovrlay');
  }

  isSuccessFullSubmit($event: any) {
    if ($event) {
      this.getDefinitionDetail(this.selectedDefinition);
    }
  }

  openHeadingForm() {
    this.isOpenDefHeading = true;
    $('.detailvieBlur').addClass('ovrlay');
  }

  closeDefHeading($event: boolean) {
    this.isOpenDefHeading = $event;
    $('.detailvieBlur').removeClass('ovrlay');
  }

  openQuestionForm() {
    this.isQuestionOpen = true;
    $('.detailvieBlur').addClass('ovrlay');
  }

  closeDefQuestion($event: boolean) {
    this.isQuestionOpen = $event;
    $('.detailvieBlur').removeClass('ovrlay');
  }

  openTemplateIssue() {
    this.templateIssueOpen = true;
    $('.detailvieBlur').addClass('ovrlay');
  }

  closeTemplateIssue($event) {
    this.templateIssueOpen = $event;
    $('.detailvieBlur').removeClass('ovrlay');
  }

  openTemplateAction() {
    this.templateActionOpen = true;
    $('.detailvieBlur').addClass('ovrlay');
  }

  closeTemplateAction($event) {
    this.templateActionOpen = $event;
    $('.detailvieBlur').removeClass('ovrlay');
  }

  openEditScoringrules() {
    this.scoringRulesOpen = true;
    $('.detailvieBlur').addClass('ovrlay');
  }

  closeScoringRules($event) {
    this.scoringRulesOpen = $event;
    $('.detailvieBlur').removeClass('ovrlay');
  }

}
