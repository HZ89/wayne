import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BreadcrumbService } from '../../../shared/client/v1/breadcrumb.service';
import { Router } from '@angular/router';
import { State } from '@clr/angular';
import { Record } from '../../../shared/model/v1/record';
import { Page } from '../../../shared/page/page-state';
import { AceEditorService } from '../../../shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../shared/ace-editor/ace-editor';

@Component({
  selector: 'list-record',
  templateUrl: 'list-record.component.html'
})
export class ListRecordComponent implements OnInit {

  @Input() recordes: Record[];

  @Input() page: Page;
  currentPage = 1;
  state: State;

  @Output() paginate = new EventEmitter<State>();
  @Output() delete = new EventEmitter<Record>();
  @Output() edit = new EventEmitter<Record>();


  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private aceEditorService: AceEditorService
  ) {
    breadcrumbService.hideRoute('/admin/record/relate-tpl');
    breadcrumbService.hideRoute('/admin/record/app');
  }

  ngOnInit(): void {
  }

  refresh(state: State) {
    this.state = state;
    this.paginate.emit(state);
  }

  deleteRecord(record: Record) {
    this.delete.emit(record);
  }

  editRecord(record: Record) {
    this.edit.emit(record);
  }

  detailMetaDataTpl(tpl: string) {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(tpl, false, '元数据查看'));
  }
}
