import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import * as moment from "moment";
import { EMPTY } from "rxjs";
import { tap, mergeMap, map, catchError, switchMap, concatMap, take, takeWhile } from "rxjs/operators";
import { SQLService } from "../services/sql.service";
import { action_delShouxu, action_delShouxuSuccess, action_getAllCase, action_getAllCaseSuccess, action_getUnfreezeDocumber, action_getUfreezeDocnumberSuccess, action_getShouxuData, action_getShouxuDataSuccess, action_insertCaseSuccess, action_insertLawase, action_insertShouxu, action_insertShouxuSuccess, action_loadConfigData, action_loadConfigDataSuccess, action_updateLawcase, action_updateLawcaseSuccess, action_updateUnfreezeData, action_updateUnfreezeDataSuccess } from "./app-actions";
import { ConfigData, PhpFunctionName } from "./app-entities";
import { selector_selectedCase, selector_shouxuType } from "./app-selector";

@Injectable()
export class AppEffects {

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private sqlService: SQLService,
        private store: Store
    ) { }

    loadConfigData$ = createEffect(() => this.actions$.pipe(
        ofType(action_loadConfigData),
        tap(action => console.log(action)),
        mergeMap(() => this.http.get<ConfigData>('assets/data.json').pipe(
            map(configData => action_loadConfigDataSuccess(configData)),
            catchError(() => EMPTY)
        ))
    ));

    getAllCase$ = createEffect(() => this.actions$.pipe(
        ofType(action_getAllCase),
        tap(a => console.log('after oftype all case', a)),
        mergeMap(() => this.sqlService.exec(PhpFunctionName.SELECT_CASES, null).pipe(
            map(cases => action_getAllCaseSuccess({ lawcases: cases })),
            catchError(() => EMPTY)
        ))
    ))

    /**获取案件的手续数据 */
    getShouxuData$ = createEffect(() => this.actions$.pipe(
        ofType(action_getShouxuData),
        concatMap(() => this.store.select(selector_selectedCase).pipe(
            //如果未选择案件
            takeWhile(LawCase => Boolean(LawCase)),
            take(1),
            map(lawcase => ({ caseID: lawcase.id })),
        )),
        concatMap((data) => this.store.select(selector_shouxuType).pipe(
            take(1),
            map(shouxuType => {
                data['tableName'] = shouxuType.value
                return data
            }),
            tap(a => console.log(a)),
        )),
        switchMap(data => this.sqlService.exec(PhpFunctionName.SELECT_CASE_ITEMS, data).pipe(
            map(shouxuData => action_getShouxuDataSuccess({ data: shouxuData }))
        ))
    ))

    /**插入案件 */
    insertCase$ = createEffect(() => this.actions$.pipe(
        ofType(action_insertLawase),
        map(action => action.data),
        tap(a => console.log(a)),
        switchMap((data) => this.sqlService.exec(PhpFunctionName.INSERT, data).pipe(
            map((res) => action_insertCaseSuccess({ data: res[0] })),
            catchError(() => EMPTY)
        ))
    ))

    /**插入手续数据 */
    insertShouxuData$ = createEffect(() => this.actions$.pipe(
        ofType(action_insertShouxu),
        switchMap(action => this.sqlService.exec(PhpFunctionName.INSERT, action.data).pipe(
            map(res =>action_insertShouxuSuccess({ data: res[0] })),
            catchError(() => EMPTY)
        ))
    ))

    updateLawcase$ = createEffect(() => this.actions$.pipe(
        ofType(action_updateLawcase),
        mergeMap((action) => this.sqlService.exec(PhpFunctionName.UPDATE, action.data).pipe(
            map((res) => {
                //服务器端返回影响的行数
                if (res > 0) {
                    console.log({ ...action.data.tableData, id: action.data.id })
                    return action_updateLawcaseSuccess({ data: { ...action.data.tableData, id: action.data.id } })
                }
                return null
            }),
            catchError(() => EMPTY)
        ))
    ))

    delShouxu$ = createEffect(() => this.actions$.pipe(
        ofType(action_delShouxu),
        mergeMap(action => this.sqlService.exec(PhpFunctionName.DEL, action.data).pipe(
            map((res) => {
                console.log('del ')
                //服务器端返回影响的行数
                if (res > 0) {
                    return action_delShouxuSuccess({ data: { id: action.data.id } })
                }
                return null
            }),
            catchError(() => EMPTY)
        ))
    ))

    getLastDongjieData$ = createEffect(() => this.actions$.pipe(
        ofType(action_getUnfreezeDocumber),
        mergeMap(action => this.sqlService.exec('selectLastDocNumber2', null).pipe(
            map((res) => {
                console.log(res)
                const docnumber = this.createUnfreezeDocnumber(res);
                return action_getUfreezeDocnumberSuccess({docnumber:docnumber})
            }),
            catchError(() => EMPTY)
        ))
    ))

    createUnfreezeDocnumber(data: any) {
        let docNumber;
        if (data.length > 0) {
            const item = data[0];
            let nowYear = moment().format('YYYY');
            const lastYear = item.createDate.substr(0, 4)
            let lastDocNumber = item.unfreezeDocNumber
            if (!lastDocNumber) lastDocNumber = 0;

            if (nowYear === lastYear) {
                docNumber = parseInt(lastDocNumber) + 1;
            } else {
                docNumber = 1
            }
        } else {
            docNumber = 1;
        }
        return docNumber;
    }

    updateUnfreezeData$ = createEffect(() => this.actions$.pipe(
        ofType(action_updateUnfreezeData),
        mergeMap(action => this.sqlService.exec(PhpFunctionName.UPDATE, action.data).pipe(
            map((res) => action_updateUnfreezeDataSuccess({data:action.data})),
            catchError(() => EMPTY)
        ))
    ))

}
