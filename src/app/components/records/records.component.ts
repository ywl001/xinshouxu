import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LawCase } from 'src/app/models/lawCase';
import { PhpFunctionName } from 'src/app/php-function-name';
import { MessageService } from 'src/app/services/message.service';
import { SQLService } from 'src/app/services/sql.service';
import * as pinyin from 'pinyin'
import { State } from 'src/app/state';
import { Chaxun } from 'src/app/models/chaxun';
import { Observable } from 'rxjs';
import { Dongjie } from 'src/app/models/Dongjie';
import { Router } from '@angular/router';
import { AddCaseComponent } from '../add-case/add-case.component';
import { MatExpansionPanel } from '@angular/material/expansion';

declare var alertify;
@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit {

  /**
  * 案件列表
  */
  private allCase!: LawCase[];

  /**显示的案件 */
  caseList!: LawCase[];

  items: any;

  caseFilterControl = new FormControl();

  //当前点击的面板
  private currentPanel: MatExpansionPanel;

  @Input() state: State;

  constructor(private sql: SQLService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private message: MessageService) { }

  ngOnInit(): void {
    this.getAllCase();
    this.caseFilterControl.valueChanges.subscribe(value => {
      this.caseList = this.filter(this.allCase, value)
    })

    this.message.saveDataComplete$.subscribe(() => {
      this.refreshItems();
    })

    this.message.stateChange$.subscribe(state => {
      this.refreshItems()
    })

    this.message.unfreezeInfo$.subscribe(() => {
      this.refreshItems()
    })

    this.message.caseChange$.subscribe(() => { this.getAllCase() })
  }

  onClick(c: LawCase, ep: MatExpansionPanel) {
    this.currentPanel = ep;
    LawCase.currentCase = c;
    this.getItems(c)
    this.message.clickCase(c);
  }

  onDblClickCase(lawCase) {
    console.log('dbl click');
    let dialogRef = this.dialog.open(AddCaseComponent, { disableClose: false })
    dialogRef.componentInstance.data = lawCase;
  }

  onItemClick(item) {
    this.message.clickCaseItem(item)
  }

  private getItems(c: LawCase) {
    this.sql.exec(PhpFunctionName.SELECT_CASE_ITEMS, { tableName: State.currentState.value, caseID: c.id }).subscribe(res => {
      this.items = res;
    })
  }

  onDelete(item) {
    alertify.set({
      labels: { ok: "确定", cancel: "取消" }
    });
    alertify.confirm("确定要删除吗？", e => {
      if (e) {
        this.onDeleteRecord(item);
      }
    });
  }

  private getAllCase() {
    this.sql.exec(PhpFunctionName.SELECT_CASES, null)
      .subscribe(data => {
        this.allCase = data;
        this.caseList = data;
        // console.log(this.allCase);
      })
  }

  private onDeleteRecord(item) {
    let data = {
      tableName: this.state.value,
      id: item.id
    }
    this.sql.exec(PhpFunctionName.DEL, data).subscribe(
      res => {
        //视图上面删除
        const index = this.items.findIndex(value => value === item);
        this.items.splice(index, 1);
        // this.message.delComplete()
        this.cdr.markForCheck();
      }
    )
  }

  private filter(arr: LawCase[], val: string): LawCase[] {
    if (arr && arr.length > 0) {
      if (!val || val == '') return arr;
      return arr.filter(item => {
        if (!item['caseName']) return false;
        const py_first = pinyin(item['caseName'], { style: pinyin.STYLE_FIRST_LETTER }).join('');
        const py = pinyin(item['caseName'], { style: pinyin.STYLE_NORMAL }).join('');
        return item['caseName'].indexOf(val) >= 0 || py_first.indexOf(val) >= 0 || py.indexOf(val) >= 0
      })
    }
    return arr;
  }

  private refreshItems() {
    if (LawCase.currentCase)
      this.getItems(LawCase.currentCase)
    //状态切换时，显示相应案件的手续
    if (this.currentPanel) {
      this.currentPanel.open()
    }
  }
}
