import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ConfigData } from './models/configData';
import { LawCase } from './models/lawCase';
import { MessageService } from './services/message.service';
import { State } from './state';
import * as toastr from 'toastr';
import { pipe } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AddCaseComponent } from './components/add-case/add-case.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '反诈手续';

  @ViewChild('shouxuContainer') container:ElementRef;

  states: Array<State> = [State.chaxun, State.dongjie];
  stateControl = new FormControl(State.chaxun);

  currentCase!: LawCase;

  sealControl = new FormControl(true)

  constructor(
    private message: MessageService,
    private router:Router,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.message.clickCase$.subscribe((value: LawCase) => {
      this.currentCase = value;
      this.container.nativeElement.scrollTop = 0;
    })

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((e:NavigationEnd) => {
      this.stateControl.setValue(e.url == '/dongjie' ? State.dongjie : State.chaxun)
    });
    
    this.stateControl.valueChanges.subscribe(value=>{
      State.currentState = value;
      this.message.stateChange(value)
      this.router.navigate([value.value]);
      this.container.nativeElement.scrollTop = 0;
    })

    this.sealControl.valueChanges.subscribe(value=>{
      this.message.isSeal(value)
    })
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

  onAddCase(){
    this.dialog.open(AddCaseComponent, { disableClose: false });
  }

}
