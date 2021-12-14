import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LawCase } from '../models/lawCase';
import { State } from '../state';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor() { }

  private _caseChange = new Subject();
  caseChange$ = this._caseChange.asObservable();
  caseChange() {
    this._caseChange.next('')
  }

  private _unFreezeInfo = new Subject()
  unfreezeInfo$ = this._unFreezeInfo.asObservable();
  unfreezeInfo(value:any) {
    this._unFreezeInfo.next(value)
  }

  private _clickCase = new Subject<LawCase>();
  clickCase$ = this._clickCase.asObservable();
  clickCase(value: LawCase) {
    this._clickCase.next(value)
  }

  private _clickCaseItem = new Subject();
  clickCaseItem$ = this._clickCaseItem.asObservable();
  clickCaseItem(value:any) {
    this._clickCaseItem.next(value)
  }

  private _saveImage = new Subject();
  /**监听点击存图按钮 */
  saveImage$ = this._saveImage.asObservable();
  saveImage() {
    this._saveImage.next();
  }

  private _saveData = new Subject();
  /**点击保存按钮，派发该事件*/
  saveData$ = this._saveData.asObservable();
  saveData() {
    this._saveData.next();
  }

  private _saveDataComplete = new Subject()
  saveDataComplete$ = this._saveDataComplete.asObservable()
  saveDataComplete(value: any) {
    this._saveDataComplete.next(value)
  }

  private _stateChange = new Subject<State>();
  /**对stateChange 的监听回调 */
  stateChange$ = this._stateChange.asObservable();
  stateChange(state:State) {
    this._stateChange.next(state);
  }

  private _isSeal = new Subject()
  isSeal$ = this._isSeal.asObservable()
  isSeal(value: boolean) {
    this._isSeal.next(value)
  }
}
