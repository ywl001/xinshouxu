import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PhpFunctionName } from 'src/app/php-function-name';
import { MessageService } from 'src/app/services/message.service';
import { SQLService } from 'src/app/services/sql.service';
import { State } from 'src/app/state';

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

  docNumber: number;
  createDate = moment();

  constructor(
    private sql: SQLService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private message: MessageService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.getDocNumber();
  }

  private getDocNumber() {
    this.sql.exec('selectLastDocNumber2', State.dongjie.value).subscribe(res => {
      console.log(res)
      if (res.length > 0) {
        const item = res[0];
        let nowYear = moment().format('YYYY');
        const lastYear = item.createDate.substr(0,4)
        let lastDocNumber = item.unfreezeDocNumber
        if(!lastDocNumber) lastDocNumber = 0;
        console.log(lastDocNumber,nowYear,lastYear);

        if (nowYear === lastYear) {
          this.docNumber = parseInt(lastDocNumber)+1;
        }else{
          this.docNumber = 1
        }
      } else {
        this.docNumber = 1;
      }
      this.cdr.markForCheck();
    })
  }

  onSubmit() {
    let tableData = {
      tableName: State.currentState.value,
      tableData: {
        unfreezeDocNumber: this.docNumber,
        unfreezeCreateDate: this.createDate
      },
      id: this.data.shouxuID
    }
    console.log(tableData)
    this.sql.exec(PhpFunctionName.UPDATE, tableData).subscribe(
      res => {
        this.message.unfreezeInfo(tableData.tableData)
      }
    )
  }
}
