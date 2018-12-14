import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BreadcrumbService } from '../../shared/client/v1/breadcrumb.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { State } from '@clr/angular';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationMessage } from '../../shared/confirmation-dialog/confirmation-message';
import { ConfirmationButtons, ConfirmationState, ConfirmationTargets } from '../../shared/shared.const';
import { Subscription } from 'rxjs/Subscription';
import { MessageHandlerService } from '../../shared/message-handler/message-handler.service';
import { ListRecordComponent } from './list-record/list-record.component';
import { CreateEditRecordComponent } from './create-edit-record/create-edit-record.component';
import { Record } from '../../shared/model/v1/record';
import { RecordService } from '../../shared/client/v1/record.service';
import { PageState } from '../../shared/page/page-state';

@Component({
  selector: 'wayne-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnInit, OnDestroy {
  @ViewChild(ListRecordComponent)
  list: ListRecordComponent;
  @ViewChild(CreateEditRecordComponent)
  createEdit: CreateEditRecordComponent;

  pageState: PageState = new PageState();
  recordes: Record[];
  id: string;
  domainName: string;
  componentName = 'Record';

  subscription: Subscription;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private recordService: RecordService,
    private messageHandlerService: MessageHandlerService,
    private deletionDialogService: ConfirmationDialogService) {
    breadcrumbService.addFriendlyNameForRoute('/admin/record', this.componentName + '列表');
    breadcrumbService.addFriendlyNameForRoute('/admin/record/trash', '已删除' + this.componentName + '列表');
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.RECORD) {
        let id = message.data;
        this.recordService.deleteById(this.id, id)
          .subscribe(
            response => {
              this.messageHandlerService.showSuccess('Record 删除成功！');
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
      this.id = params['id'];
      if (typeof(this.id) === 'undefined') {
        this.id = '';
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
    this.recordService.list(this.pageState, this.id)
      .subscribe(
        response => {
          const data = response.data;
          this.recordes = data ? data : [] as Record[];
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  createRecord(created: boolean) {
    if (created) {
      this.retrieve();
    }
  }

  openModal(): void {
    this.createEdit.newOrEditRecord();
  }

  deleteRecord(record: Record) {
    const deletionMessage = new ConfirmationMessage(
      '删除 Record 确认',
      '你确认删除 Record ' +  record.id + ' ？',
      record.id,
      ConfirmationTargets.RECORD,
      ConfirmationButtons.DELETE_CANCEL
    );
    this.deletionDialogService.openComfirmDialog(deletionMessage);
  }

  editRecord(record: Record) {
    this.createEdit.newOrEditRecord(record.id);
  }
}
