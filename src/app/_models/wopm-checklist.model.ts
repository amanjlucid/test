export class WopmChecklistModel {
    constructor(public wosequence : number, public wochecksurcde : number, public wostagesurcde : number, public displaysequence : number,
        public name : string, public description : string, public wostagename : string, public status : string, public comment : string, public responsibility : string,
        public cost : number, public useref2 : string, public useref3 : string, public useref4 : string, public useref5 : string,
        public checklisttype : string, public mailmergedoc : string, public attachmentrequired : string) { }

}