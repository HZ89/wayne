import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CreateEditDomainComponent } from './create-edit-domain/create-edit-domain.component';
import { DomainComponent } from './domain.component';
import { ListDomainComponent } from './list-domain/list-domain.component';
import { DomainService } from '../../shared/client/v1/domain.service';

@NgModule({
  imports: [
    SharedModule
  ],
  providers: [
    DomainService
  ],
  exports: [
    DomainComponent,
    ListDomainComponent
  ],
  declarations: [
    DomainComponent,
    ListDomainComponent,
    CreateEditDomainComponent,
  ]
})

export class DomainModule {
}
