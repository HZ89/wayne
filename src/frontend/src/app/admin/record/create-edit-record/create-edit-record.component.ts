import { Component, EventEmitter, OnInit, Output, Input, ViewChild } from '@angular/core';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgForm } from '@angular/forms';
import { ActionType } from '../../../shared/shared.const';
import { Record } from '../../../shared/model/v1/record';
import { App } from '../../../shared/model/v1/app';
import { RecordService } from '../../../shared/client/v1/record.service';
import { AppService } from '../../../shared/client/v1/app.service';
import { AceEditorBoxComponent } from '../../../shared/ace-editor/ace-editor-box/ace-editor-box.component';
import { MessageHandlerService } from '../../../shared/message-handler/message-handler.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DomainService } from 'app/shared/client/v1/domain.service';

@Component({
  selector: 'create-edit-record',
  templateUrl: 'create-edit-record.component.html',
  styleUrls: ['create-edit-record.component.scss']
})
export class CreateEditRecordComponent implements OnInit{

  @Output() create = new EventEmitter<boolean>();
  modalOpened: boolean;

  ngForm: NgForm;
  @ViewChild('ngForm')
  currentForm: NgForm;

  record: Record = new Record();
  checkOnGoing = false;
  isSubmitOnGoing  = false;
  id: string;
  domainName: string;

  title: string;
  actionType: ActionType;

  apps: App[];

  constructor(private recordService: RecordService,
              private domainService: DomainService,
              private appService: AppService,
              private messageHandlerService: MessageHandlerService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.appService
      .getNames()
      .subscribe(
        response => {
          this.apps = response.data;
        },
        error => this.messageHandlerService.handleError(error)
      );
    this.route.params.subscribe(params => {
      this.id = params['id'];
      if (typeof(this.id) === 'undefined') {
        this.id = '';
      }
    });
    this.domainService.getById(Number(this.id)).subscribe(res => {
      this.domainName = res.data.name;
    });
  }

  newOrEditRecord(id?: number) {
    this.modalOpened = true;
    if (id) {
      this.actionType = ActionType.EDIT;
      this.title = '编辑 Record';
      this.recordService.getById(this.id, id).subscribe(
        status => {
          this.record = status ? status.data : {id: id} as Record
        },
        error => {
          this.messageHandlerService.handleError(error);

        });
    } else {
      this.actionType = ActionType.ADD_NEW;
      this.title = '创建 Record';
      this.record = new Record();
      this.record.domainName = this.domainName;
      this.record.enabled = true;
    }
  }

  initJsonEditor(): void {
  }

  onCancel() {
    this.modalOpened = false;
    this.currentForm.reset();
  }

  onSubmit() {
    if (this.isSubmitOnGoing) {
      return;
    }
    this.isSubmitOnGoing = true;
    switch (this.actionType) {
      case ActionType.ADD_NEW:
        this.recordService.create(this.record, this.id).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('创建 Record 成功！');
          },
          error => {
            this.isSubmitOnGoing = false;
            this.modalOpened = false;
            this.messageHandlerService.handleError(error);

          }
        );
        break;
      case ActionType.EDIT:
        this.recordService.update(this.record, this.id).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('更新 Record 成功！');
          },
          error => {
            this.isSubmitOnGoing = false;
            this.modalOpened = false;
            this.messageHandlerService.handleError(error);

          }
        );
        break;
    }
  }

  public get isValid(): boolean {
    return this.currentForm &&
      this.currentForm.valid &&
      !this.isSubmitOnGoing &&
      !this.checkOnGoing;
  }
}

