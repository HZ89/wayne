import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BreadcrumbService } from '../../shared/client/v1/breadcrumb.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { State } from '@clr/angular';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationMessage } from '../../shared/confirmation-dialog/confirmation-message';
import { ConfirmationButtons, ConfirmationState, ConfirmationTargets} from '../../shared/shared.const';
import { Subscription } from 'rxjs/Subscription';
import { MessageHandlerService } from '../../shared/message-handler/message-handler.service';
import { ListDomainTplComponent } from './list-domaintpl/list-domaintpl.component';
import { CreateEditDomainTplComponent } from './create-edit-domaintpl/create-edit-domaintpl.component';
import { DomainTplService } from '../../shared/client/v1/domaintpl.service';
import { DomainTpl } from '../../shared/model/v1/domaintpl';
import { PageState } from '../../shared/page/page-state';

@Component({
  selector: 'wayne-domaintpl',
  templateUrl: './domaintpl.component.html',
  styleUrls: ['./domaintpl.component.scss']
})
export class DomainTplComponent implements OnInit, OnDestroy {
  @ViewChild(ListDomainTplComponent)
  list: ListDomainTplComponent;
  @ViewChild(CreateEditDomainTplComponent)
  createEdit: CreateEditDomainTplComponent;

  pageState: PageState = new PageState({pageSize: 10});
  domainTpls: DomainTpl[];
  serviceId: string;
  componentName = 'Domain 模板';

  subscription: Subscription;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private domainTplService: DomainTplService,
    private messageHandlerService: MessageHandlerService,
    private deletionDialogService: ConfirmationDialogService) {
    breadcrumbService.addFriendlyNameForRoute('/admin/domain/tpl', this.componentName + '列表');
    breadcrumbService.addFriendlyNameForRoute('/admin/domain/tpl/trash', '已删除' + this.componentName + '列表');
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.SERVICE_TPL) {
        let id = message.data;
        this.domainTplService.deleteById(id, 0)
          .subscribe(
            response => {
              this.messageHandlerService.showSuccess('Domain 模版删除成功！');
              this.retrieve();
            },
            error => {
              this.messageHandlerService.handleError(error);
            }
          );
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.serviceId = params['sid'];
      if (typeof(this.serviceId) === 'undefined') {
        this.serviceId = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  retrieve(state?: State): void {
    if (state) {
      this.pageState = PageState.fromState(state, {pageSize: 10, totalPage: this.pageState.page.totalPage, totalCount: this.pageState.page.totalCount});
    }
    this.pageState.params['deleted'] = false;
    this.domainTplService.listPage(this.pageState, 0, this.serviceId)
      .subscribe(
        response => {
          let data = response.data;
          this.pageState.page.totalPage = data.totalPage;
          this.pageState.page.totalCount = data.totalCount;
          this.domainTpls = data.list;
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  createDomainTpl(created: boolean) {
    if (created) {
      this.retrieve();
    }
  }

  openModal(): void {
    this.createEdit.newOrEditServiceTpl();
  }

  deleteDomainTpl(domainTpl: DomainTpl) {
    const deletionMessage = new ConfirmationMessage(
      '删除 Domain 模版确认',
      '你确认删除 Domain 模版 ' + domainTpl.name + ' ？',
      domainTpl.id,
      ConfirmationTargets.INGRESS_TPL,
      ConfirmationButtons.DELETE_CANCEL
    );
    this.deletionDialogService.openComfirmDialog(deletionMessage);
  }

  editDomainTpl(domainTpl: DomainTpl) {
    this.createEdit.newOrEditServiceTpl(domainTpl.id);
  }
}
