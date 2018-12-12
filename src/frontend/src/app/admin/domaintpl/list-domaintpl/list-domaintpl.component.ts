import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@clr/angular';
import { DomainTpl } from '../../../shared/model/v1/domaintpl';
import { Page } from '../../../shared/page/page-state';

@Component({
  selector: 'list-domaintpl',
  templateUrl: 'list-domaintpl.component.html'
})
export class ListDomainTplComponent implements OnInit {

  @Input() domainTpls: DomainTpl[];

  @Input() page: Page;
  currentPage = 1;
  state: State;

  @Output() paginate = new EventEmitter<State>();
  @Output() delete = new EventEmitter<DomainTpl>();
  @Output() edit = new EventEmitter<DomainTpl>();


  constructor(private router: Router) {
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

  deleteDomainTpl(domainTpl: DomainTpl) {
    this.delete.emit(domainTpl);
  }

  editDomainTpl(domainTpl: DomainTpl) {
    this.edit.emit(domainTpl);
  }
}
