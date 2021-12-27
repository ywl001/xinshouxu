import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { action_updateLawcase as action_update_lawcase, action_insertLawase as action_insert_lawcase } from 'src/app/app-store/app-actions';
import { MessageService } from 'src/app/services/message.service';
import * as toastr from 'toastr';

@Component({
  selector: 'app-add-case',
  templateUrl: './add-case.component.html',
  styleUrls: ['./add-case.component.scss']
})
export class AddCaseComponent {

  constructor(private store: Store) { }

  lawCaseID: string;
  caseName: string;
  caseNumber: string;
  caseContent: string;

  isEdit: boolean;

  set data(value) {
    console.log(value);
    this.lawCaseID = value.id;
    this.caseName = value.caseName;
    this.caseNumber = value.caseNumber;
    this.caseContent = value.caseContent;
    this.isEdit = true;
  }

  onSubmit() {
    if (this.isEdit) {
      let data = {
        tableName: 'law_case',
        tableData: this.sqlData,
        id: this.lawCaseID
      }
      this.store.dispatch(action_update_lawcase({ data: data }))
      toastr.info('更新案件成功')
    } else {
      let data = {
        tableName: 'law_case',
        tableData: this.sqlData
      }
      this.store.dispatch(action_insert_lawcase({ data: data }));
      toastr.info('添加案件成功')
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
