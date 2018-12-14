import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CreateEditRecordComponent } from './create-edit-record/create-edit-record.component';
import { RecordComponent } from './record.component';
import { ListRecordComponent } from './list-record/list-record.component';
import { RecordService } from '../../shared/client/v1/record.service';

@NgModule({
  imports: [
    SharedModule
  ],
  providers: [
    RecordService
  ],
  exports: [
    RecordComponent,
    ListRecordComponent
  ],
  declarations: [
    RecordComponent,
    ListRecordComponent,
    CreateEditRecordComponent
  ]
})

export class RecordModule {
}
