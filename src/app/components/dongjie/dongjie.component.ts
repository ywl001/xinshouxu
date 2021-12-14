import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment, { Moment } from "moment";
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ShouxuComponent } from '../shouxu.component';
import * as toastr from 'toastr';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AddUnfreezeComponent } from '../add-unfreeze/add-unfreeze.component';
import { Dongjie } from 'src/app/models/Dongjie';
import { ClipboardService } from 'ngx-clipboard';


@Component({
  selector: 'app-dongjie',
  templateUrl: './dongjie.component.html',
  styleUrls: ['./dongjie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ]
})
export class DongjieComponent extends ShouxuComponent implements OnInit {

  //导出图像的html
  @ViewChild('tzs') tzsElementRef: ElementRef;
  @ViewChild('bgs') bgsElementRef: ElementRef;


  ////////////////////////////////////和html绑定的变量///////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  //表单
  group = this.fb.group({
    createDate: [moment()],
    company: [''],
    requestUser1: ['蒋勉丽'],
    requestUser2: ['牛萌萌'],
    freezeName: [''],
    freezeNumber: [''],
    docNumber: [''],
    freezeMoney: ['全额冻结']
  });

  //数据对象
  // model: Dongjie;

  //文书中冻结的开始和结束日期
  year_start;
  month_start;
  day_start;
  year_end;
  month_end;
  day_end;

  //添加冻结手续后的单选按钮组
  freezeState = new FormControl('freeze')

  //是否是新见手续
  isNewCreate: boolean = true;
  //是否添加了解除冻结手续
  isAddUnfreeze: boolean;

  // companys$!: Observable<any>;

  freezeCreateDate: Moment;
  unfreezeCreateDate: Moment;
  freezeDocNumber: string;
  unfreezeDocNumber: string;

  shouxuID: number;

  get isUnfreezeState() {
    if (this.isNewCreate) return false;
    if (this.freezeState && this.freezeState.value == 'unfreeze') return true;
    return false;
  }

  get freezeNumber() {
    return this.getFcVal('freezeNumber')
  }

  get freezeName() {
    return this.getFcVal('freezeName')
  }

  get freezeMoney() {
    return this.getFcVal('freezeMoney')
  }

  // get level(){
  //   return this.ara2cn(this.getFcVal('level'))
  // }

  private unfreezeInfo: Subscription

  constructor(private cdr: ChangeDetectorRef, public route: ActivatedRoute, private clipboardService: ClipboardService) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._freezeCreateDate = moment();

    this.getFc('freezeNumber').valueChanges.subscribe(value => {
      const ids = value?.match(/[\w\.@]{6,}/g);
      if (ids && ids.length > 0 && this.getBankNameByCard(ids[0])) {
        this.setFcVal('company', this.getBankNameByCard(ids[0]))
      }
    })

    this.unfreezeInfo = this.message.unfreezeInfo$.subscribe((res: any) => {
      if (res) {
        this.unfreezeDocNumber = res.unfreezeDocNumber;
        this.unfreezeCreateDate = res.unfreezeCreateDate;
        this.isAddUnfreeze = true;
        this.cdr.markForCheck()
      }
    })

    this.freezeState.valueChanges.subscribe(value => {
      if (value === 'freeze') {
        this.setFcVal('createDate', this.freezeCreateDate);
        this.setFcVal('docNumber', this.freezeDocNumber)
      } else {
        this.setFcVal('createDate', this.unfreezeCreateDate)
        this.setFcVal('docNumber', this.unfreezeDocNumber)
      }
      this.cdr.markForCheck();
    })
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.unfreezeInfo.unsubscribe();
  }

  clear() {
    this.group.reset({
      createDate: moment(),
      requestUser1: '蒋勉丽',
      requestUser2: '牛萌萌',
      freezeMoney: '全额冻结',
      docNumber: { value: '', disabled: true },
    })
    this.isNewCreate = true;
  }

  validate() {
    if (this.isEmptyStr(this.company)) {
      toastr.warning('请选择金融机构')
      return false;
    }
    if (this.isEmptyStr(this.freezeNumber)) {
      toastr.warning('请填写冻结的账号')
      return false;
    }
    if (this.isEmptyStr(this.freezeMoney)) {
      toastr.warning('请填写冻结的金额')
      return false;
    }
    return true;
  }

  getTableData() {
    let data = this.group.value;
    data.caseID = this.lawCase.id;
    data.createDate = this.createDate.format('YYYY-MM-DD')
    return data;
  }

  getCDInstance() {
    return this.cdr;
  }

  getImgInfos() {
    this.copyDocNumber()
    let str = this.freezeState.value === 'unfreeze' ? '解冻' : '冻结'

    return [
      { element: this.tzsElementRef.nativeElement, imgName: this.docNumber + '号-' + str + '-通知' },
      { element: this.bgsElementRef.nativeElement, imgName: this.docNumber + '号-' + str + '-报告' }
    ];
  }

  getLawDocNumber() {
    if (this.freezeState.value == 'unfreezeState')
      return `${this.unit_1}（${this.unit_3}）解冻财字[${this.year_start}]`;
    return `${this.unit_1}（${this.unit_3}）冻财字[${this.year_start}]`;
  }

  onAddUnfreeze() {
    this.dialog.open(AddUnfreezeComponent, { data: { shouxuID: this.shouxuID } })
  }

  set data(value: Dongjie) {
    console.log('dongjie set data', value)
    if (value) {
      this.group.patchValue({
        createDate: moment(value.createDate),
        company: value.company,
        docNumber: value.docNumber,
        freezeName: value.freezeName,
        freezeNumber: value.freezeNumber,
        freezeMoney: value.freezeMoney,
        requestUser1: value.requestUser1,
        requestUser2: value.requestUser2
      })

      this.shouxuID = value.id;
      this._freezeCreateDate = moment(value.createDate);
      this.freezeDocNumber = value.docNumber;
      this.unfreezeCreateDate = moment(value.unfreezeCreateDate);
      this.unfreezeDocNumber = value.unfreezeDocNumber;

      this.isNewCreate = false;
      this.isAddUnfreeze = this.unfreezeDocNumber && Boolean(this.unfreezeCreateDate);

      this.freezeState.setValue('freeze')
      this.cdr.markForCheck()
    }
  }

  get freezeNumberFontSize() {
    if (!this.freezeNumber) return '';

    if (this.freezeNumber.length <= 36)
      return '22px';
    else if (this.freezeNumber.length > 36 && this.freezeNumber.length <= 40)
      return '20px';
    else if (this.freezeNumber.length > 40 && this.freezeNumber.length <= 44)
      return '18px';
    else if (this.freezeNumber.length > 44 && this.freezeNumber.length <= 50)
      return '16px';
    else if (this.freezeNumber.length > 50 && this.freezeNumber.length <= 56)
      return '14px';
    else
      return '12px'
  }

  private set _freezeCreateDate(value) {
    this.freezeCreateDate = value;
    this.year_start = this.getYear(value)
    this.month_start = this.getMonth(value);
    this.day_start = this.getDay(value);

    const endDate = value.clone().add(6, 'month');
    this.year_end = this.getYear(endDate);
    this.month_end = this.getMonth(endDate);
    this.day_end = this.getDay(endDate);
  }

  private getBankNameByCard(idCard: string) {
    if (!idCard)
      return;
    for (let i = 10; i > 2; i--) {
      if (this.bankBin[idCard.substr(0, i)])
        return this.bankBin[idCard.substr(0, i)];
    }
    return ""
  }

  copyDocNumber() {
    let str = this.freezeState.value === 'unfreeze' ? '解冻' : '冻';
    this.clipboardService.copy(`${this.unit_1}（unit_3）${str}财字[${this.year_start}]${this.docNumber}号`);
    toastr.success('法律文书编号已复制')
  }

  toDaxie() {
    if (isNaN(this.freezeMoney)) {
      toastr.warning('输入的不是数字')
    } else {
      const dx = this.convertCurrency(this.freezeMoney);
      this.setFcVal('freezeMoney', dx);
    }
  }

  /**数字转大写 */
  convertCurrency(money) {
    //汉字的数字
    var cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
    //基本单位
    var cnIntRadice = new Array('', '拾', '佰', '仟');
    //对应整数部分扩展单位
    var cnIntUnits = new Array('', '万', '亿', '兆');
    //对应小数部分单位
    var cnDecUnits = new Array('角', '分', '毫', '厘');
    //整数金额时后面跟的字符
    var cnInteger = '整';
    //整型完以后的单位
    var cnIntLast = '元';
    //最大处理的数字
    var maxNum = 999999999999999.9999;
    //金额整数部分
    var integerNum;
    //金额小数部分
    var decimalNum;
    //输出的中文金额字符串
    var chineseStr = '';
    //分离金额后用的数组，预定义
    var parts;
    if (money == '') { return ''; }
    money = parseFloat(money);
    if (money >= maxNum) {
      //超出最大处理数字
      return '';
    }
    if (money == 0) {
      chineseStr = cnNums[0] + cnIntLast + cnInteger;
      return chineseStr;
    }
    //转换为字符串
    money = money.toString();
    if (money.indexOf('.') == -1) {
      integerNum = money;
      decimalNum = '';
    } else {
      parts = money.split('.');
      integerNum = parts[0];
      decimalNum = parts[1].substr(0, 4);
    }
    //获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
      var zeroCount = 0;
      var IntLen = integerNum.length;
      for (var i = 0; i < IntLen; i++) {
        var n = integerNum.substr(i, 1);
        var p = IntLen - i - 1;
        var q = p / 4;
        var m = p % 4;
        if (n == '0') {
          zeroCount++;
        } else {
          if (zeroCount > 0) {
            chineseStr += cnNums[0];
          }
          //归零
          zeroCount = 0;
          chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
        }
        if (m == 0 && zeroCount < 4) {
          chineseStr += cnIntUnits[q];
        }
      }
      chineseStr += cnIntLast;
    }
    //小数部分
    if (decimalNum != '') {
      var decLen = decimalNum.length;
      for (var i = 0; i < decLen; i++) {
        var n = decimalNum.substr(i, 1);
        if (n != '0') {
          chineseStr += cnNums[Number(n)] + cnDecUnits[i];
        }
      }
    }
    if (chineseStr == '') {
      chineseStr += cnNums[0] + cnIntLast + cnInteger;
    } else if (decimalNum == '') {
      chineseStr += cnInteger;
    }
    return chineseStr;
  }
}
