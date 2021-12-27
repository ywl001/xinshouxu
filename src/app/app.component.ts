import { Component, ComponentFactoryResolver, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MessageService } from './services/message.service';
import * as toastr from 'toastr';
import { MatDialog } from '@angular/material/dialog';
import { AddCaseComponent } from './components/add-case/add-case.component';
import { ShouxuComponent } from './components/shouxu.component';
import { ChaxunComponent } from './components/chaxun/chaxun.component';
import { DongjieComponent } from './components/dongjie/dongjie.component';
import { Store } from '@ngrx/store';
import { selector_selectedCase } from './app-store/app-selector';
import { action_shouxuTypeChange, action_loadConfigData, action_getAllCase, action_getShouxuData, action_isSealChange } from './app-store/app-actions';
import { chaxunType, dongjieType, Lawcase, ShouxuType } from './app-store/app-entities';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '反诈手续';

  @ViewChild('shouxuContainer', { static: false, read: ViewContainerRef }) shouxuContainer?: ViewContainerRef;
  @ViewChild('rightContainer', { static: false }) rightContainer?: ElementRef;

  shouxuTypes: Array<ShouxuType> = [chaxunType, dongjieType];

  currentShouxuType: ShouxuType = chaxunType;

  currentCase$ = this.store.select(selector_selectedCase);

  stateControl = new FormControl(chaxunType);
  sealControl = new FormControl(true)

  constructor(
    private message: MessageService,
    private dialog: MatDialog,
    private resolver: ComponentFactoryResolver,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(action_loadConfigData());
    this.store.dispatch(action_getAllCase());

    //单击案件后滚动条到顶部
    this.message.clickCase$.subscribe((value: Lawcase) => {
      this.rightContainer.nativeElement.scrollTop = 0;
    })

    // 手续类型单选按钮变化
    this.stateControl.valueChanges.subscribe(value => {
      this.currentShouxuType = value;
      // 在store中存储当前的手续状态
      this.store.dispatch(action_shouxuTypeChange({ shouxuType: this.stateControl.value }))
      this.store.dispatch(action_getShouxuData())
      this.createComponent(value)
    })

    this.sealControl.valueChanges.subscribe(value=>{
      this.store.dispatch(action_isSealChange({isSeal:value}))
    })
  }

  ngAfterViewInit() {
    this.createComponent(chaxunType)
  }

  /**创建动态组件 */
  private createComponent(shouxuType: ShouxuType) {
    this.shouxuContainer.clear();
    let shouxuComponent: ShouxuComponent
    if (shouxuType == chaxunType) {
      shouxuComponent = this.getShouxuInstance(ChaxunComponent);
    }
    else if (shouxuType == dongjieType) {
      shouxuComponent = this.getShouxuInstance(DongjieComponent);
    }
    shouxuComponent.shouxuType = shouxuType
  }
  //获取各种手续的实例
  private getShouxuInstance(className) {
    let factory = this.resolver.resolveComponentFactory(className)
    let componentRef = this.shouxuContainer.createComponent(factory);
    return <ShouxuComponent>componentRef.instance;
  }

  onCbSuccess() {
    toastr.success('复制成功')
  }

  onSaveData() {
    this.message.saveData();
  }

  onSaveImage() {
    this.message.saveImage()
  }

  onAddCase() {
    this.dialog.open(AddCaseComponent, { disableClose: false });
  }

}
