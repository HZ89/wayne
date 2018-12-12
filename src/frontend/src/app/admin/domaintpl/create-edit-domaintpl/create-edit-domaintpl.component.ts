import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgForm } from '@angular/forms';
import { MessageHandlerService } from '../../../shared/message-handler/message-handler.service';
import { ActionType } from '../../../shared/shared.const';
import { isUndefined } from 'util';
import { DomainTpl } from '../../../shared/model/v1/domaintpl';
import { Domain } from '../../../shared/model/v1/domain';
import { DomainTplService } from '../../../shared/client/v1/domaintpl.service';
import { DomainService } from '../../../shared/client/v1/domain.service';
import { AceEditorBoxComponent } from '../../../shared/ace-editor/ace-editor-box/ace-editor-box.component';
import { AceEditorService } from '../../../shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../shared/ace-editor/ace-editor';

@Component({
  selector: 'create-edit-domaintpl',
  templateUrl: 'create-edit-domaintpl.component.html',
  styleUrls: ['create-edit-domaintpl.scss']
})
export class CreateEditDomainTplComponent implements OnInit{
  @Output() create = new EventEmitter<boolean>();
  modalOpened: boolean;

  ngForm: NgForm;
  @ViewChild('ngForm')
  currentForm: NgForm;

  domainTpl: DomainTpl = new DomainTpl();
  checkOnGoing = false;
  isSubmitOnGoing = false;

  title: string;
  actionType: ActionType;

  domaines: Domain[];

  @ViewChild(AceEditorBoxComponent) aceBox: any;
  constructor(private domainTplService: DomainTplService,
              private domainService: DomainService,
              private messageHandlerService: MessageHandlerService,
              private aceEditorService: AceEditorService) {
  }

  ngOnInit(): void {
    this.domainService.getNames().subscribe(
      response => {
        this.domaines = response.data;
      },
      error => this.messageHandlerService.handleError(error)
    );
  }

  initJsonEditor(): void {
    let json = {};
    if (this.domainTpl && this.domainTpl.template) {
      json = JSON.parse(this.domainTpl.template);
    }
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(json));
  }

  newOrEditServiceTpl(id?: number) {
    this.modalOpened = true;
    if (id) {
      this.actionType = ActionType.EDIT;
      this.title = '编辑 Domain 模版';
      this.domainTplService.getById(id, 0).subscribe(
        status => {
          this.domainTpl = status.data;
          this.initJsonEditor();
        },
        error => {
          this.messageHandlerService.handleError(error);

        });
    } else {
      this.actionType = ActionType.ADD_NEW;
      this.title = '创建 Domain 模版';
      this.domainTpl = new DomainTpl();
      this.initJsonEditor();
    }
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
    if (!this.aceBox.isValid) {
      alert('语法有误，请检查！');
      this.isSubmitOnGoing = false;
      return;
    }
    this.domainTpl.template = this.aceBox.getValue();
    for (let domain of this.domaines) {
      if (domain.id === this.domainTpl.domainId) {
        this.domainTpl.name = domain.name;
      }
    }
    switch (this.actionType) {
      case ActionType.ADD_NEW:
        this.domainTplService.create(this.domainTpl, 0).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('创建 Domain 模版成功！');
          },
          error => {
            this.isSubmitOnGoing = false;
            this.modalOpened = false;
            this.messageHandlerService.handleError(error);

          }
        );
        break;
      case ActionType.EDIT:
        this.domainTplService.update(this.domainTpl, 0).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('更新 Domain 模版成功！');
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
      !this.checkOnGoing &&
      !isUndefined(this.domainTpl.domainId);
  }


}

