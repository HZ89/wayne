import { Component, OnDestroy, OnInit } from '@angular/core';
import { State } from '@clr/angular';
import { MessageHandlerService } from '../../../shared/message-handler/message-handler.service';
import { ConfirmationMessage } from '../../../shared/confirmation-dialog/confirmation-message';
import { ConfirmationButtons, ConfirmationState, ConfirmationTargets } from '../../../shared/shared.const';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { Subscription } from 'rxjs/Subscription';
import { DomainTpl } from '../../../shared/model/v1/domaintpl';
import { DomainTplService } from '../../../shared/client/v1/domaintpl.service';
import { AceEditorService } from '../../../shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../shared/ace-editor/ace-editor';
import { PageState } from '../../../shared/page/page-state';

@Component({
  selector: 'trash-domaintpl',
  templateUrl: 'trash-domaintpl.component.html'
})
export class TrashDomainTplComponent implements OnInit, OnDestroy {

  domainTpls: DomainTpl[];
  pageState: PageState = new PageState();
  currentPage = 1;
  state: State;

  subscription: Subscription;

  constructor(private domainTplService: DomainTplService,
              private messageHandlerService: MessageHandlerService,
              private deletionDialogService: ConfirmationDialogService,
              private aceEditorService: AceEditorService) {
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.TRASH_INGRESS_TPL) {
        const id = message.data;
        this.domainTplService
          .deleteById(id, 0, false)
          .subscribe(
            response => {
              this.messageHandlerService.showSuccess('Domain 删除成功！');
              this.refresh();
            },
            error => {
              this.messageHandlerService.handleError(error);
            }
          );
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  pageSizeChange(pageSize: number) {
    this.state.page.to = pageSize - 1;
    this.state.page.size = pageSize;
    this.currentPage = 1;
    this.refresh(this.state);
  }

  refresh(state?: State) {
    if (state) {
      this.state = state;
      this.pageState = PageState.fromState(state, {totalPage: this.pageState.page.totalPage, totalCount: this.pageState.page.totalCount});
    }
    this.pageState.params['deleted'] = true;
    this.domainTplService.listPage(this.pageState, 0)
      .subscribe(
        response => {
          const data = response.data;
          this.pageState.page.totalPage = data.totalPage;
          this.pageState.page.totalCount = data.totalCount;
          this.domainTpls = data.list;
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  deleteServiceTpl(domainTpl: DomainTpl) {
    const deletionMessage = new ConfirmationMessage(
      '删除服务确认',
      '你确认永久删除 Domain 模版 ' + domainTpl.name + ' ？删除后将不可恢复！',
      domainTpl.id,
      ConfirmationTargets.TRASH_INGRESS_TPL,
      ConfirmationButtons.DELETE_CANCEL
    );
    this.deletionDialogService.openComfirmDialog(deletionMessage);
  }

  tplDetail(domainTpl: DomainTpl) {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(domainTpl.template, false, '详情'));
  }

  recoverServiceTpl(domainTpl: DomainTpl) {
    domainTpl.deleted = false;
    this.domainTplService.update(domainTpl, 0)
      .subscribe(
        response => {
          this.messageHandlerService.showSuccess('Domain 模版恢复成功！');
          this.refresh();
        },
        error => this.messageHandlerService.handleError(error)
      );
  }
}
