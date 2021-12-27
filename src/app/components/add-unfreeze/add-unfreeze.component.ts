import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as moment from 'moment'
import { action_getUnfreezeDocumber, action_updateUnfreezeData } from 'src/app/app-store/app-actions';
import { dongjieType } from 'src/app/app-store/app-entities';
import { selector_unFreezeDocnumber } from 'src/app/app-store/app-selector';


@Component({
  selector: 'app-add-unfreeze',
  templateUrl: './add-unfreeze.component.html',
  styleUrls: ['./add-unfreeze.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ]
})
export class AddUnfreezeComponent implements OnInit {

  docNumber$ = this.store.select(selector_unFreezeDocnumber);
  createDate = moment();

  constructor(
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.store.dispatch(action_getUnfreezeDocumber())
  }

  onSubmit() {
    let docnumber;
    this.docNumber$.subscribe(val => docnumber = val)
    let tableData = {
      tableName: dongjieType.value,
      tableData: {
        unfreezeDocNumber: docnumber,
        unfreezeCreateDate: this.createDate
      },
      id: this.data.shouxuID
    }

    console.log(tableData)
    this.store.dispatch(action_updateUnfreezeData({ data: tableData }))
  
  }
}
