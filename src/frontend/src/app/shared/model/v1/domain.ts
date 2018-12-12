import { App } from './app';

export class Domain {
  id: number;
  name: string;
  metaData: string;
  user: string;
  appId: number;
  metaDataObj: {};
  description: string;
  deleted: boolean;
  createTime: Date;
  app: App;
  order: number;
}
