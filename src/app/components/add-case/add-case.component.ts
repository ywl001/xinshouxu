import { Component, OnInit } from '@angular/core';
import { PhpFunctionName } from 'src/app/php-function-name';
import { MessageService } from 'src/app/services/message.service';
import { SQLService } from 'src/app/services/sql.service';
import * as toastr from 'toastr';

@Component({
  selector: 'app-add-case',
  templateUrl: './add-case.component.html',
  styleUrls: ['./add-case.component.scss']
})
export class AddCaseComponent implements OnInit {

  constructor(private sqlService: SQLService, private message: MessageService) { }

  lawCaseID: string;
  caseName: string;
  caseNumber: string;
  caseContent: string;

  isEdit: boolean;

  private _data;

  set data(value) {
    console.log(value);
    this._data = value;
    this.lawCaseID = value.id;
    this.caseName = value.caseName;
    this.caseNumber = value.caseNumber;
    this.caseContent = value.caseContent;
    this.isEdit = true;
  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.isEdit) {
      let data = {
        tableName: 'law_case',
        tableData: this.sqlData,
        id: this.lawCaseID
      }
      console.log(data)
      this.sqlService.exec(PhpFunctionName.UPDATE, data).subscribe(
        res => {
          console.log(res)
          toastr.info('编辑案件成功');
          this.message.caseChange()
        }
      )
    } else {
      let data = {
        tableName: 'law_case',
        tableData: this.sqlData
      }
      this.sqlService.exec(PhpFunctionName.INSERT, data).subscribe(res => {
        console.log(res)
        if (res.length > 0) {
          toastr.info('插入案件成功');
          this.message.caseChange()
        }
      })
    }
  }

  get sqlData() {
    if (!this.caseNumber || this.caseNumber.trim() === '') {
      toastr.warning('没有案件编号')
      return null;
    }
    return {
      caseName: this.caseName,
      caseNumber: this.caseNumber,
      caseContent: this.caseContent
    }
  }
}
