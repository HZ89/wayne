import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PageState } from '../../page/page-state';
import { isNotEmpty } from '../../utils';
import { Record } from '../../model/v1/record';

@Injectable()
export class RecordService {
  headers = new HttpHeaders({'Content-type': 'application/json'});
  options = {'headers': this.headers};

  constructor(private http: HttpClient) {
  }

  list(pageState: PageState, id: string): Observable<any> {
    let params = new HttpParams();
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
      .get(`/api/v1/domain/${id}/record`, {params: params})
      .catch(error => Observable.throw(error));
  }

  create(record: Record, id: string): Observable<any> {
    return this.http
      .post(`/api/v1/domain/${id}/record`, record, this.options)
      .catch(error => Observable.throw(error));
  }

  update(record: Record, id: string): Observable<any> {
    return this.http
      .put(`/api/v1/domain/${id}/record/${record.id}`, record, this.options)
      .catch(error => Observable.throw(error));
  }

  deleteById(id: string, recordId: number): Observable<any> {
    const options: any = {};

    return this.http
      .delete(`/api/v1/domain/${id}/record/${recordId}`, options)
      .catch(error => Observable.throw(error));
  }

  getById(id: string, recordId:number): Observable<any> {
    return this.http
      .get(`/api/v1/domain/${id}/record/${recordId}`)
      .catch(error => Observable.throw(error));
  }
}
