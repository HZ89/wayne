import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgForm } from '@angular/forms';
import { ActionType } from '../../../shared/shared.const';
import { Domain } from '../../../shared/model/v1/domain';
import { App } from '../../../shared/model/v1/app';
import { DomainService } from '../../../shared/client/v1/domain.service';
import { AppService } from '../../../shared/client/v1/app.service';
import { AceEditorBoxComponent } from '../../../shared/ace-editor/ace-editor-box/ace-editor-box.component';
import { AceEditorService } from '../../../shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../shared/ace-editor/ace-editor';
import { MessageHandlerService } from '../../../shared/message-handler/message-handler.service';

@Component({
  selector: 'create-edit-domain',
  templateUrl: 'create-edit-domain.component.html',
  styleUrls: ['create-edit-domain.component.scss']
})
export class CreateEditDomainComponent implements OnInit{
  @Output() create = new EventEmitter<boolean>();
  modalOpened: boolean;

  ngForm: NgForm;
  @ViewChild('ngForm')
  currentForm: NgForm;

  @ViewChild(AceEditorBoxComponent)
  aceBox: any;

  domain: Domain = new Domain();
  checkOnGoing = false;
  isSubmitOnGoing  = false;
  isNameValid = true;

  title: string;
  actionType: ActionType;

  apps: App[];

  constructor(private domainService: DomainService,
              private appService: AppService,
              private aceEditorService: AceEditorService,
              private messageHandlerService: MessageHandlerService) {
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
  }

  newOrEditDomain(id?: number) {
    this.modalOpened = true;
    if (id) {
      this.actionType = ActionType.EDIT;
      this.title = '编辑 Domain';
      this.domainService.getById(id, 0).subscribe(
        status => {
          this.domain = status.data
          this.domain.metaDataObj = JSON.parse(this.domain.metaData ? this.domain.metaData : '{}');
          this.initJsonEditor();
        },
        error => {
          this.messageHandlerService.handleError(error);

        });
    } else {
      this.actionType = ActionType.ADD_NEW;
      this.title = '创建 Domain';
      this.domain = new Domain();
      this.domain.metaDataObj = {};
      this.initJsonEditor();
    }
  }

  initJsonEditor(): void {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(this.domain.metaDataObj));
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
    this.domain.metaData = this.aceBox.getValue();
    switch (this.actionType) {
      case ActionType.ADD_NEW:
        this.domainService.create(this.domain).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('创建 Domain 成功！');
          },
          error => {
            this.isSubmitOnGoing = false;
            this.modalOpened = false;
            this.messageHandlerService.handleError(error);

          }
        );
        break;
      case ActionType.EDIT:
        this.domainService.update(this.domain).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('更新 Domain 成功！');
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
      this.isNameValid &&
      !this.checkOnGoing;
  }

  // Handle the form validation
  handleValidation(): void {
    const cont = this.currentForm.controls['name'];
    if (cont) {
      this.isNameValid = cont.valid;
    }

  }

}

