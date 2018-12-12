import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BreadcrumbService } from '../../shared/client/v1/breadcrumb.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { State } from '@clr/angular';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationMessage } from '../../shared/confirmation-dialog/confirmation-message';
import { ConfirmationButtons, ConfirmationState, ConfirmationTargets } from '../../shared/shared.const';
import { Subscription } from 'rxjs/Subscription';
import { MessageHandlerService } from '../../shared/message-handler/message-handler.service';
import { ListDomainComponent } from './list-domain/list-domain.component';
import { CreateEditDomainComponent } from './create-edit-domain/create-edit-domain.component';
import { Domain } from '../../shared/model/v1/domain';
import { DomainService } from '../../shared/client/v1/domain.service';
import { PageState } from '../../shared/page/page-state';

@Component({
  selector: 'wayne-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.scss']
})
export class DomainComponent implements OnInit, OnDestroy {
  @ViewChild(ListDomainComponent)
  list: ListDomainComponent;
  @ViewChild(CreateEditDomainComponent)
  createEdit: CreateEditDomainComponent;

  pageState: PageState = new PageState();
  domaines: Domain[];
  appId: string;
  componentName = 'Domain';

  subscription: Subscription;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private domainService: DomainService,
    private messageHandlerService: MessageHandlerService,
    private deletionDialogService: ConfirmationDialogService) {
    breadcrumbService.addFriendlyNameForRoute('/admin/domain', this.componentName + '列表');
    breadcrumbService.addFriendlyNameForRoute('/admin/domain/trash', '已删除' + this.componentName + '列表');
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.INGRESS) {
        let id = message.data;
        this.domainService.deleteById(id)
          .subscribe(
            response => {
              this.messageHandlerService.showSuccess('Domain 删除成功！');
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
      this.appId = params['aid'];
      if (typeof(this.appId) === 'undefined') {
        this.appId = '';
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
      this.pageState = PageState.fromState(state, {totalPage: this.pageState.page.totalPage, totalCount: this.pageState.page.totalCount});
    }
    this.domainService.list(this.pageState)
      .subscribe(
        response => {
          const data = response.data;
          this.pageState.page.totalPage = data.totalPage;
          this.pageState.page.totalCount = data.totalCount;
          this.domaines = data.list;
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  createDomain(created: boolean) {
    if (created) {
      this.retrieve();
    }
  }

  openModal(): void {
    this.createEdit.newOrEditDomain();
  }

  deleteDomain(domain: Domain) {
    const deletionMessage = new ConfirmationMessage(
      '删除 Domain 确认',
      '你确认删除 Domain ' +  domain.name + ' ？',
      domain.id,
      ConfirmationTargets.INGRESS,
      ConfirmationButtons.DELETE_CANCEL
    );
    this.deletionDialogService.openComfirmDialog(deletionMessage);
  }

  editDomain(domain: Domain) {
    this.createEdit.newOrEditDomain(domain.id);
  }
}
