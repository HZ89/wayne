import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CreateEditDomainTplComponent } from './create-edit-domaintpl/create-edit-domaintpl.component';
import { DomainTplComponent } from './domaintpl.component';
import { ListDomainTplComponent } from './list-domaintpl/list-domaintpl.component';
import { TrashDomainTplComponent } from './trash-domaintpl/trash-domaintpl.component';
import { DomainService } from '../../shared/client/v1/domain.service';

@NgModule({
  imports: [
    SharedModule
  ],
  providers: [
    DomainService
  ],
  exports: [
    DomainTplComponent,
    ListDomainTplComponent
  ],
  declarations: [
    DomainTplComponent,
    ListDomainTplComponent,
    CreateEditDomainTplComponent,
    TrashDomainTplComponent,
  ]
})

export class DomainTplModule {
}
