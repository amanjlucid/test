export class WorkordersPhaseChecklistModel {
  WOSEQUENCE: number = 0
  WOPSEQUENCE: number = 0
  Contractor: boolean = false;
  AssetStatus: string = ''
  StageName: string = ''
  ChecKName: string = ''
  CheckResp: string = ''
  CheckSpecial: string = ''
  CheckStatus: string = ''

  OrderBy: string = 'AssId'
  OrderType: string = 'Ascending'
  CurrentPage: number = 0;
  PageSize: number = 50;

  StageCategory:string = ''// need to remove
  CheckListCategory:string = ''
  AssId: string = ''
  Address: string = ''
  // StartDate: string = ''
  // TargetDate: string = ''
  // IssueDate: string = ''
  // CompletionDate: string = ''

  FromStartDate: string;
  ToStartDate: string;
  FromTargetDate: string;
  ToTargetDate: string;
  FromIssueDate: string;
  ToIssueDate: string;
  FromCompletionDate: string;
  ToCompletionDate: string;

}