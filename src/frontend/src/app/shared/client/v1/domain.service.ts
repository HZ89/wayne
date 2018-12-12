import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PageState } from '../../page/page-state';
import { isNotEmpty } from '../../utils';
import { OrderItem } from '../../model/v1/order';
import { Domain } from '../../model/v1/domain';

@Injectable()
export class DomainService {
  headers = new HttpHeaders({'Content-type': 'application/json'});
  options = {'headers': this.headers};

  constructor(private http: HttpClient) {
  }

  getNames(): Observable<any> {
    const params = new HttpParams();
    return this.http
      .get(`/api/v1/domain/names`, {params: params})
      .catch(error => Observable.throw(error));
  }

  list(pageState: PageState, deleted: 'true' | 'false'): Observable<any> {
    let params = new HttpParams();
    params = params.set('pageNo', pageState.page.pageNo + '');
    params = params.set('pageSize', pageState.page.pageSize + '');
    params = params.set('deleted', deleted);
    Object.getOwnPropertyNames(pageState.params).map(key => {
      const value = pageState.params[key];
      if (isNotEmpty(value)) {
        params = params.set(key, value);
      }
    });
    const filterList: Array<string> = [];
    Object.getOwnPropertyNames(pageState.filters).map(key => {
      const value = pageState.filters[key];
      if (isNotEmpty(value)) {
        if (key === 'deleted' || key === 'id') {
          filterList.push(`${key}=${value}`);
        } else {
          filterList.push(`${key}__contains=${value}`);
        }
      }
    })
    if (filterList.length) {
      params = params.set('filter', filterList.join(','));
    }
    // sort param
    if (Object.keys(pageState.sort).length !== 0 && pageState.sort.by !== 'app.name') {
      const sortType: any = pageState.sort.reverse ? `-${pageState.sort.by}` : pageState.sort.by;
      params = params.set('sortby', sortType);
    }
    return this.http
      .get(`/api/v1/domain`, {params: params})
      .catch(error => Observable.throw(error));
  }

  create(domain: Domain): Observable<any> {
    return this.http
      .post(`/api/v1/domain`, domain, this.options)
      .catch(error => Observable.throw(error));
  }

  update(domain: Domain): Observable<any> {
    return this.http
      .put(`/api/v1/domain/${domain.id}`, domain, this.options)
      .catch(error => Observable.throw(error));
  }

  deleteById(id: number, logical?: boolean): Observable<any> {
    const options: any = {};
    if (logical != null) {
      let params = new HttpParams();
      params = params.set('logical', logical + '');
      options.params = params
    }

    return this.http
      .delete(`/api/v1/domain/${id}`, options)
      .catch(error => Observable.throw(error));
  }

  getById(id: number): Observable<any> {
    return this.http
      .get(`/api/v1/domain/${id}`)
      .catch(error => Observable.throw(error));
  }
}
