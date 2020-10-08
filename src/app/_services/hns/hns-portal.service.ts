import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appConfig } from '../../app.config';


@Injectable()
export class HnsPortalService {

    constructor(private http: HttpClient) { }

    getChartType() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyChart/GetHealtSafetyChartList`, httpOptions);
    }

    getChartData(chartDetail) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(chartDetail);
        return this.http.post<any>(`${appConfig.apiUrl}/api/Chart/GetChartData`, body, httpOptions);
        //return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyChart/GetHealtSafetyChartData`, body, httpOptions);
    }

    getUserChartData(userId: string, dashboard: string) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/Chart/GetUserChartData?userId=${userId}&dashboard=${dashboard}`, httpOptions);
    }

    saveUserChartData(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let userid = params.UserId
        let body = JSON.stringify({ chartData: params.ChartData });
        return this.http.post<any>(`${appConfig.apiUrl}/api/Chart/SaveUserChartData?userId=${userid}&dashboard=${params.dashboard}`, body, httpOptions);
    }

    getHealtSafetyDefinatonList(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(params);
        //const {textString, activeStatus, inactiveStatus, allStatus} = params;
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealtSafetyDefinatonList`, body, httpOptions);
    }

    changeStatus(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion, status } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/ActiveInactiveHealthSafetyDefination?hasCode=${hasCode}&hasVersion=${hasVersion}&status=${status}`, httpOptions);
    }

    getSurveyTypes() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetSurveyTypeList`, httpOptions);
    }

    saveDefinition(params: any, mode: string) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        if (mode == "new") {
            return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddNewDefination`, body, httpOptions);
        } else if (mode == "edit" || mode == "view") {
            return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateHealthSafetyDefination`, body, httpOptions);
        } else if (mode == "copy") {
            return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/CopyHealthSafetyDefination`, body, httpOptions);
        }

    }

    getDefinitionVersion(hascode) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetNewDefinitionVersion?hascode=${hascode}`, httpOptions);
    }


    deleteDefinition(param: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let { hascode, hasversion } = param;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteHealthSafetyDefination?hasCode=${hascode}&hasVersion=${hasversion}`, httpOptions);
    }



    getDefinitionDetail(param: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let { hascode, hasversion } = param;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyDefinitionsDetailView?hasCode=${hascode}&hasVersion=${hasversion}`, httpOptions);

    }

    moveNodes(moveCase: string, params: any) {
        switch (moveCase) {
            case "grpSeq": return this.moveGroupSeq(params);
            case "quesSeq": return this.moveQuesSeq(params);
            case "quesHead": return this.moveQuesToHeading(params);
            case "headSeq": return this.moveHeadingSeq(params);
            case "headGrp": return this.moveHeadingToGroup(params);
            default: return null;
        }
    }

    moveGroupSeq(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/MoveGroupSequence`, body, httpOptions);
    }

    moveHeadingToGroup(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/MoveHeadingToGroup`, body, httpOptions);
    }

    moveHeadingSeq(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/MoveHeadingSequence`, body, httpOptions);
    }

    moveQuesToHeading(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/MoveQuestionToHeading`, body, httpOptions);
    }

    moveQuesSeq(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/MoveQuestionSequence`, body, httpOptions);
    }

    createDefGrp(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddDefinitionsHealthSafetyGroup`, body, httpOptions);
    }

    updateHnsGrp(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateDefinitionsHealthSafetyGroup`, body, httpOptions);
    }

    saveHnsGrp(params: any, mode: string) {
        if (mode == "new") {
            return this.createDefGrp(params);
        } else if (mode == "change") {
            return this.updateHnsGrp(params);
        }
    }

    deleteDefinitionGrp(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteDefinitionsHealthSafetyGroup`, body, httpOptions);
    }

    createDefHeading(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddDefinitionsHealthSafetyHeadings`, body, httpOptions);
    }

    updateHnsHeading(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateDefinitionsHealthSafetyHeading`, body, httpOptions);
    }

    saveHnsHeading(params: any, mode: string) {
        if (mode == "new") {
            return this.createDefHeading(params);
        } else if (mode == "change") {
            return this.updateHnsHeading(params);
        }
    }

    deleteDefinitionHeading(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteDefinitionsHealthSafetyHeading`, body, httpOptions);
    }

    getCharacteristic(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { searchString, dataType } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetCharacteristics?dataType=${dataType}&TextString=${searchString}`, httpOptions);
    }

    saveQuestion(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddDefinitionsHealthSafetyQuestion`, body, httpOptions);
    }

    updateQuestion(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateDefinitionsHealthSafetyQuestion`, body, httpOptions);
    }

    deleteQuestion(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteDefinitionsHealthSafetyQuestion`, body, httpOptions);
    }

    getTemplateIssueList(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        // const { hascode, hasversion, hasgroupid, hasheadingid, hasquestionid, textstring } = params;
        // return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyQuestionissues?hascode=${hascode}&hasversion=${hasversion}&hasgroupid=${hasgroupid}&hasheadingid=${hasheadingid}&hasquestionid=${hasquestionid}&textstring=${textstring}`, httpOptions);

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyQuestionissues`, body, httpOptions);
    }

    saveTemplateIssue(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddHealthSafetyIssue`, body, httpOptions);
    }

    updateTemplateIssue(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateHealthSafetyIssue`, body, httpOptions);
    }

    deleteTemplateIssue(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteHealthSafetyIssue`, body, httpOptions);
    }

    getTemplateActionList(params: any) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };

        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyQuestionAction`, body, httpOptions);
    }

    saveTemplateAction(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddHealthSafetyAction`, body, httpOptions);
    }

    updateTemplateAction(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateHealthSafetyAction`, body, httpOptions);
    }

    deleteTemplateAction(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteHealthSafetyAction`, body, httpOptions);
    }

    getScoringRuleText(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetScoringRuleText`, body, httpOptions);
    }


    insertScoringRules(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/InsertHealthSafetyQustionScoring`, body, httpOptions);
    }

    updateScoringRules(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateHealthSafetyQustionScoring`, body, httpOptions);
    }

    deleteScoringRules(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteHealthSafetyQustionScoring`, body, httpOptions);
    }


    questionScoring(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyQuestionsScoring`, body, httpOptions);
    }

    percentageChangeQuestionScoring(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hascode, hasversion } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetPercentageChangeHealthSafetyQuestionsScoring?hascode=${hascode}&hasversion=${hasversion}`, httpOptions);
    }

    instanceCountQuestionScoring(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hascode, hasversion } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetInstanceCountHealthSafetyQuestionsScoring?hascode=${hascode}&hasversion=${hasversion}`, httpOptions);
    }

    /** hns priority list api */

    getPriorityList(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyPriority?hasCode=${hasCode}&hasVersion=${hasVersion}`, httpOptions);
    }

    addPriority(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddHealthSafetyPriority`, body, httpOptions);
    }

    updatePriority(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateHealthSafetyPriority`, body, httpOptions);
    }

    deletePriority(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteHealthSafetyPriority`, body, httpOptions);
    }

    movePrioritySeq(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/MovePrioritySequence`, body, httpOptions);
    }


    getPriorityMinNmaxScore(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetMaxRiskMatrixForScore?hasCode=${hasCode}&hasVersion=${hasVersion}`, httpOptions);
    }

    /** hns budget list api */

    getbudgetList(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyBudget?hasCode=${hasCode}&hasVersion=${hasVersion}`, httpOptions);
    }

    getSpecificHnSBudget(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion, hasBudgetCode } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetSpecificHealthSafetyBudget?hasCode=${hasCode}&hasVersion=${hasVersion}&hasBudgetCode=${hasBudgetCode}`, httpOptions);
    }

    addBudget(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddHealthSafetyBudget`, body, httpOptions);
    }

    updateBudget(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateHealthSafetyBudget`, body, httpOptions);
    }

    deleteBudget(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteHealthSafetyBudget`, body, httpOptions);
    }

    /** scoring bands api */

    getScoringBands(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyScoringBands?hasCode=${hasCode}&hasVersion=${hasVersion}`, httpOptions);
    }

    addScoringBand(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        //let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddHealthSafetyScoringBand`, params, httpOptions);
    }

    // updateScoringBands(params){
    //     let httpOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/json'
    //         }),
    //     };
    //     let body = JSON.stringify(params);
    //     return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateHealthSafetyScoringBand`, body, httpOptions);
    // }

    deleteScoringBand(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteHealthSafetyScoreBand`, body, httpOptions);
    }


    /** serverity api start */
    getSeverityList(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetySeverity?hasCode=${hasCode}&hasVersion=${hasVersion}`, httpOptions);
    }

    addSeverity(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddHealthSafetySeverity`, body, httpOptions);
    }

    updateSeverity(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateHealthSafetySeverity`, body, httpOptions);
    }

    deleteSeverity(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteHealthSafetySeverity`, body, httpOptions);
    }

    moveSeveritySeq(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/MoveSeveritySequence`, body, httpOptions);
    }


    /** serverity api start */
    getProbabilityList(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyProbability?hasCode=${hasCode}&hasVersion=${hasVersion}`, httpOptions);
    }

    addProbability(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/AddHealthSafetyProbability`, body, httpOptions);
    }

    updateProbability(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/UpdateHealthSafetyProbability`, body, httpOptions);
    }

    deleteProbability(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/DeleteHealthSafetyProbability`, body, httpOptions);
    }

    moveProbabilitySeq(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/MoveProbabilitySequence`, body, httpOptions);
    }


    /** recalculate score */

    recalculateScore(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion, modifiedby } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/RecalculateScoresForDefinition?hasCode=${hasCode}&hasVersion=${hasVersion}&modifiedby=${modifiedby}`, httpOptions);
    }

    report(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        const { hasCode, hasVersion, Dependency } = params;
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/GetHealthSafetyDefinitionReport?hasCode=${hasCode}&hasVersion=${hasVersion}&Dependency=${Dependency}`, httpOptions);
    }

    validateBudget(hasCode, hasVersion, budgetCode) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyResult/CheckBudgetCodeValidation?hasCode=${hasCode}&hasVersion=${hasVersion}&budgetCode=${budgetCode}`, httpOptions)
    }


    validateQuesCode(params) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        let body = JSON.stringify(params);
        return this.http.post<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/HaSValidateQuestionCode`, body, httpOptions);
    }

    HASDefinitionValidationResult(hasCode, hasVersion) {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        };
        return this.http.get<any>(`${appConfig.apiUrl}/api/HealthSafetyDefination/HASDefinitionValidationResult?hasCode=${hasCode}&hasVersion=${hasVersion}`, httpOptions)
    }


}