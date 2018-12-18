import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { MessageHandlerService } from '../../../shared/message-handler/message-handler.service';
import { ActionType } from '../../../shared/shared.const';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppService } from '../../../shared/client/v1/app.service';
import { CacheService } from '../../../shared/auth/cache.service';
import { AceEditorService } from '../../../shared/ace-editor/ace-editor.service';
import { defaultIngress } from '../../../shared/default-models/ingress.const';
import { IngressTpl } from '../../../shared/model/v1/ingresstpl';
import { IngressService } from '../../../shared/client/v1/ingress.service';
import { IngressTplService } from '../../../shared/client/v1/ingresstpl.service';
import { AuthService } from '../../../shared/auth/auth.service';
import { IngressRule, KubeIngress } from '../../../shared/model/v1/kubernetes/ingress';
import { DomainService } from 'app/shared/client/v1/domain.service';
import { Domain } from 'domain';
import { App } from 'app/shared/model/v1/app';
import { Ingress } from 'app/shared/model/v1/ingress';
import { CreateEditResourceTemplate } from 'app/shared/base/resource/create-edit-resource-template';


@Component({
  selector: 'create-edit-ingresstpl',
  templateUrl: './create-edit-ingresstpl.component.html',
  styleUrls: ['./create-edit-ingresstpl.scss']
})
export class CreateEditIngressTplComponent extends CreateEditResourceTemplate implements OnInit {
  actionType: ActionType;
  app: App;
  ingress: Ingress;
  kubeIngress: KubeIngress;
  addDomainText: string = "自动解析";
  addDomain: boolean = true;
  domaines: Domain[];

  labelSelector = [];


  constructor(private ingressTplService: IngressTplService,
              private ingressService: IngressService,
              public location: Location,
              public router: Router,
              public appService: AppService,
              public route: ActivatedRoute,
              public authService: AuthService,
              public cacheService: CacheService,
              public aceEditorService: AceEditorService,
              public messageHandlerService: MessageHandlerService,
              private domainService: DomainService
  ) {
    super(
      ingressTplService,
      ingressService,
      location,
      router,
      appService,
      route,
      authService,
      cacheService,
      aceEditorService,
      messageHandlerService
    );
    super.registResourceType('ingress');
    super.registDefaultKubeResource(defaultIngress);
    this.template = new IngressTpl()
  }

  initDefault() {
    this.kubeIngress = JSON.parse(defaultIngress);
    console.log(this.kubeIngress);
  }


  onAddSelector() {
    this.labelSelector.push({'key': '', 'value': ''});
  }

  ngOnInit(): void {
    this.kubeResource = JSON.parse(this.defaultKubeResource);

    const appId = parseInt(this.route.parent.snapshot.params['id'], 10);
    const namespaceId = this.cacheService.namespaceId;
    const ingressId = parseInt(this.route.snapshot.params['resourceId'], 10);
    const tplId = parseInt(this.route.snapshot.params['tplId'], 10);
    const observables = Array(
      this.appService.getById(appId, namespaceId),
      this.ingressService.getById(ingressId, appId),
    );
    if (tplId) {
      this.actionType = ActionType.EDIT;
      observables.push(this.ingressTplService.getById(tplId, appId));
    } else {
      this.actionType = ActionType.ADD_NEW;
    }
    Observable.combineLatest(observables).subscribe(
      response => {
        this.app = response[0].data;
        this.resource = response[1].data;
        const tpl = response[2];
        if (tpl) {
          this.template = tpl.data;
          this.template.description = null;
          this.saveResourceTemplate();
        }
      },
      error => {
        this.messageHandlerService.handleError(error);
      }
    );
    this.domainService.getNames().subscribe(res => {
      this.domaines = res.data;
    })
    this.initDefault();
  }

  isValidResource(): boolean {
    if (super.isValidResource() === false) {
      return false;
    }
    if (this.kubeResource.spec.rules.length === 0) {
      return false;
    }
    if (this.kubeResource.spec.rules.length === 0) {
      return false;
    }
    for (const rule of this.kubeResource.spec.rules) {
      if (rule.host.length === 0) {
        return false;
      }
      if (rule.http.paths.length === 0) {
        return false;
      }
      for (const svc of rule.http.paths) {
        if (svc.backend.servicePort.IntVal === 0 || svc.backend.serviceName.length === 0) {
          return false;
        }
        if (svc.path.length === 0) {
          return false;
        }
      }
    }
    return true;
  }

  // 监听提交表单的事件
  onSubmit() {
    if (this.isSubmitOnGoing) {
      return;
    }
    this.isSubmitOnGoing = true;

    console.log(this.resource);
    console.log(this.kubeResource);

    let resourceObj = JSON.parse(JSON.stringify(this.kubeResource));
    resourceObj = this.generateResource(resourceObj);
    this.template.ingressId = this.resource.id;
    this.template.template = JSON.stringify(resourceObj);

    this.template.id = undefined;
    this.template.name = this.resource.name;

    console.log(this.template);
    this.ingressTplService.createWithDomain(this.template, this.app.id, this.addDomain).subscribe(
      status => {
        this.isSubmitOnGoing = false;
        this.router.navigate(
          [`portal/namespace/${this.cacheService.namespaceId}/app/${this.app.id}/${this.resourceType}/${this.resource.id}`]
        );
        // TODO 路由变化后下面不会生效
        this.messageHandlerService.showSuccess('创建' + this.resourceType + '模板成功！');
      },
      error => {
        this.isSubmitOnGoing = false;
        this.messageHandlerService.handleError(error);

      }
    );
  }

  changeAddDomain(i: number) {
    this.addDomain = !this.addDomain;
    this.addDomainText = this.addDomain ? "自动解析" : "手动填写";
    this.kubeResource.spec.rules[i].host = "";
  }
}

