import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BreadcrumbService } from '../../../shared/client/v1/breadcrumb.service';
import { Router } from '@angular/router';
import { State } from '@clr/angular';
import { Domain } from '../../../shared/model/v1/domain';
import { Page } from '../../../shared/page/page-state';
import { AceEditorService } from '../../../shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../shared/ace-editor/ace-editor';

@Component({
  selector: 'list-domain',
  templateUrl: 'list-domain.component.html'
})
export class ListDomainComponent implements OnInit {

  @Input() domaines: Domain[];

  @Input() page: Page;
  currentPage = 1;
  state: State;

  @Output() paginate = new EventEmitter<State>();
  @Output() delete = new EventEmitter<Domain>();
  @Output() edit = new EventEmitter<Domain>();


  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private aceEditorService: AceEditorService
  ) {
    breadcrumbService.hideRoute('/admin/domain/relate-tpl');
    breadcrumbService.hideRoute('/admin/domain/app');
  }

  ngOnInit(): void {
  }

  pageSizeChange(pageSize: number) {
    this.state.page.to = pageSize - 1;
    this.state.page.size = pageSize;
    this.currentPage = 1;
    this.paginate.emit(this.state);
  }

  refresh(state: State) {
    this.state = state;
    this.paginate.emit(state);
  }

  deleteDomain(domain: Domain) {
    this.delete.emit(domain);
  }

  editService(domain: Domain) {
    this.edit.emit(domain);
  }

  goToLink(domain: Domain, gate: string) {
    let linkUrl = new Array();
    switch (gate) {
      case 'tpl':
        this.breadcrumbService.addFriendlyNameForRouteRegex('/admin/domain/relate-tpl/[0-9]*', '[' + domain.name + ']模板列表');
        linkUrl = ['admin', 'service', 'relate-tpl', domain.id];
        break;
      case 'app':
        this.breadcrumbService.addFriendlyNameForRouteRegex('/admin/domain/app/[0-9]*', '[' + domain.app.name + ']项目详情');
        linkUrl = ['admin', 'service', 'app', domain.app.id];
        break;
      default:
        break;
    }
    this.router.navigate(linkUrl);
  }

  detailMetaDataTpl(tpl: string) {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(tpl, false, '元数据查看'));
  }
}
