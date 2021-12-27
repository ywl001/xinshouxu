import { Component, OnInit, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatExpansionPanel } from "@angular/material/expansion";
import { Store } from "@ngrx/store";
import pinyin from "pinyin";
import { startWith, switchMap, map } from "rxjs/operators";
import { action_clickLawcase, action_getShouxuData, action_saveShouxuItem, action_delShouxu } from "src/app/app-store/app-actions";
import { ShouxuType, Lawcase } from "src/app/app-store/app-entities";
import { selector_shouxuData, selector_allCase } from "src/app/app-store/app-selector";
import { MessageService } from "src/app/services/message.service";
import { AddCaseComponent } from "../add-case/add-case.component";


declare var alertify;
@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit {

  /**显示的案件列表 */
  caseList$

  items$ = this.store.select(selector_shouxuData)

  caseFilterControl: FormControl = new FormControl();

  //当前点击的面板
  private currentPanel: MatExpansionPanel;

  @Input() shouxuType: ShouxuType;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private message: MessageService) { }

  ngOnInit(): void {
    this.items$.subscribe(() => {
      if (this.currentPanel) this.currentPanel.open()
    })

    this.caseList$ = this.caseFilterControl.valueChanges.pipe(
      startWith(''),
      switchMap((val) => this.store.select(selector_allCase).pipe(
        map(allCases => {
          if (!val || val == '') return allCases;
          return allCases.filter(item => {
            if (!item['caseName']) return false;
            const py_first = pinyin(item['caseName'], { style: pinyin.STYLE_FIRST_LETTER }).join('');
            const py = pinyin(item['caseName'], { style: pinyin.STYLE_NORMAL }).join('');
            return item['caseName'].indexOf(val) >= 0 || py_first.indexOf(val) >= 0 || py.indexOf(val) >= 0
          })
        })
      ))
    )
  }

  onClick(lawcase: Lawcase, ep: MatExpansionPanel) {
    this.currentPanel = ep;
    //存储当前案件到store
    this.store.dispatch(action_clickLawcase({ lawcase: lawcase }))
    //获取案件的手续数据
    this.store.dispatch(action_getShouxuData())
    //点击事件带来的其他效果，（清除表单数据，滚动条到顶部）
    this.message.clickCase(lawcase);
  }

  /**双击编辑案件 */
  onDblClickCase(lawCase) {
    console.log('dbl click');
    let dialogRef = this.dialog.open(AddCaseComponent, { disableClose: false })
    dialogRef.componentInstance.data = lawCase;
  }

  onItemClick(item) {
    // 存储当前手续数据
    this.store.dispatch(action_saveShouxuItem({ data: item }))
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

  private onDeleteRecord(item) {
    let data = {
      tableName: this.shouxuType.value,
      id: item.id
    }
    this.store.dispatch(action_delShouxu({ data: data }))
  }

}
