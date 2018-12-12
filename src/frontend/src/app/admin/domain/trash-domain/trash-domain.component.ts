import { Component, OnDestroy, OnInit } from '@angular/core';
import { State } from '@clr/angular';
import { MessageHandlerService } from '../../../shared/message-handler/message-handler.service';
import { ConfirmationMessage } from '../../../shared/confirmation-dialog/confirmation-message';
import { ConfirmationButtons, ConfirmationState, ConfirmationTargets} from '../../../shared/shared.const';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { Subscription } from 'rxjs/Subscription';
import { Domain } from '../../../shared/model/v1/domain';
import { DomainService } from '../../../shared/client/v1/domain.service';
import { PageState } from '../../../shared/page/page-state';
import { AceEditorService } from '../../../shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../shared/ace-editor/ace-editor';

@Component({
  selector: 'trash-domain',
  templateUrl: 'trash-domain.component.html'
})
export class TrashDomainComponent implements OnInit, OnDestroy {

  domaines: Domain[];
  pageState: PageState = new PageState();
  currentPage = 1;
  state: State;

  subscription: Subscription;

  constructor(private domainService: DomainService,
              private messageHandlerService: MessageHandlerService,
              private deletionDialogService: ConfirmationDialogService,
              private aceEditorService: AceEditorService) {
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.TRASH_SERVICE) {
        let id = message.data;
        this.domainService.deleteById(id, false)
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
    this.domainService.list(this.pageState, 'true')
      .subscribe(
        response => {
          let data = response.data;
          this.pageState.page.totalPage = data.totalPage;
          this.pageState.page.totalCount = data.totalCount;
          this.domaines = data.list;
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  deleteDomain(domain: Domain) {
    let deletionMessage = new ConfirmationMessage(
      '删除 Domain 确认',
      '你确认永久删除 Domain ' + domain.name + ' ？删除后将不可恢复！',
      domain.id,
      ConfirmationTargets.TRASH_INGRESS,
      ConfirmationButtons.DELETE_CANCEL
    );
    this.deletionDialogService.openComfirmDialog(deletionMessage);
  }

  recoverDomain(domain: Domain) {
    this.domainService
      .update(domain)
      .subscribe(
        response => {
          this.messageHandlerService.showSuccess('Domain 恢复成功！');
          this.refresh();
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  detailMetaDataTpl(tpl: string) {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(tpl, false, '元数据查看'));
  }
}
