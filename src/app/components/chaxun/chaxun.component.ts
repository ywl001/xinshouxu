import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';

import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { ShouxuComponent } from '../shouxu.component';
import * as toastr from 'toastr';
import { selector_shouxuItem } from 'src/app/app-store/app-selector';
import { Chaxun } from 'src/app/app-store/app-entities';

@Component({
  selector: 'app-chaxun',
  templateUrl: './chaxun.component.html',
  styleUrls: ['./chaxun.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ]
})
export class ChaxunComponent extends ShouxuComponent implements OnInit {

  @ViewChild('root') rootElement: ElementRef;
  @ViewChild('tzs') tzsElementRef: ElementRef;
  @ViewChild('bgs') bgsElementRef: ElementRef;


  data$ = this.store.select(selector_shouxuItem)
  group = this.fb.group({
    createDate: [moment()],
    company: ['',],
    requestUser1: ['蒋勉丽',],
    requestUser2: ['牛萌萌',],
    queryType: ['',],
    docNumber: [''],
    queryContent: ['',],
  });

  get docNumber() {
    return this.getFcVal('docNumber')
  }

  get queryContent() {
    return this.getFcVal('queryContent')
  }

  get queryType() {
    return this.getFcVal('queryType')
  }

  constructor(private cdr: ChangeDetectorRef) {
    super();
    console.log('chaxun constructor');
  }

  ngOnInit(): void {
    super.ngOnInit();
    
    this.setCompanyValueByBankbin('queryContent','company')

    this.data$.subscribe(
      (value: Chaxun) => {
        if (value) {
          this.group.patchValue({
            createDate: moment(value.createDate),
            company: value.company,
            docNumber: value.docNumber,
            queryContent: value.queryContent,
            queryType: value.queryType,
            requestUser1: value.requestUser1,
            requestUser2: value.requestUser2
          })
        }
      })
  }

  ngOnDestroy() {
    super.ngOnDestroy()
  }

  /////////////////////////////////////复写父类方法//////////////////////////////////////
  clear() {
    this.group.reset({
      createDate: moment(),
      requestUser1: '蒋勉丽',
      requestUser2: '牛萌萌',
      docNumber: { value: '', disabled: true },
      company: ''
    })
  }

  validate() {
    if (!this.lawcase) {
      toastr.warning('请选择案件')
      return false;
    }
    if (this.isEmptyStr(this.company)) {
      toastr.warning('请选择金融机构')
      return false;
    }
    if (this.isEmptyStr(this.queryType)) {
      toastr.warning('请选择财产种类')
      return false;
    }
    if (this.isEmptyStr(this.queryContent)) {
      toastr.warning('请填写查询账号信息')
      return false;
    }
    return true;
  }

  getTableData() {
    return this.group.value;
  }

  getImgInfos() {
    return [
      { element: this.tzsElementRef.nativeElement, imgName: this.docNumber + '号-查询-通知' },
      { element: this.bgsElementRef.nativeElement, imgName: this.docNumber + '号-查询-报告' }
    ];
  }

  //绑定文号中年份
  get year() {
    return this.getYear(this.getFcVal('createDate'))
  }

  //查询内容，返回字符串数组
  getQueryContent() {
    const text: string = this.getFcVal('queryContent');
    if (text) {
      const banjiao = text.match(/[\u0000-\u00ff]/g)
      let arr = text.split('');
      const quanjiao_len = arr.length - banjiao?.length;
      //字符最小总长度，如果不够则补充空格
      const min_total_len = 141;
      const mat_total_len = 296;
      const add_len = min_total_len - banjiao.length - quanjiao_len * 2;
      for (let i = 0; i < add_len; i++) {
        arr.push("&ensp;")
      }

      if (quanjiao_len * 2 + banjiao.length > 296) {
        toastr.warning('你输入的账户长度超出了限制，部分内容无法显示')
      }
      return arr;
    }
    return [];
  }
}

