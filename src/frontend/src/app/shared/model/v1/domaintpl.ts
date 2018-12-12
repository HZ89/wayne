import {Domain} from './domain';
import {PublishStatus} from './publish-status';

export class DomainTpl {
  id: number;
  name: string;
  domainId: number;
  template: string;
  description: string;
  deleted: boolean;
  user: string;
  createTime: Date;
  domain: Domain;

  ports: string;
  status: PublishStatus[];
}
