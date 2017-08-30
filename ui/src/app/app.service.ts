import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Task } from './task';

@Injectable()
export class AppService {
  // private apiUrl = 'http://localhost:50000';
  private apiUrl = 'http://localhost:3000';
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http) {};

  private handleError(error: any): Promise<any> {
    console.error('An error occured', error);
    return Promise.reject(error.message || error);
  }

  getTasks(): Promise<Task[]> {
    const url = `${this.apiUrl}/tasks`;

    return this.http.get(url, {headers: this.headers})
      .toPromise()
      .then(response => response.json().tasks)
      .catch(this.handleError);
  }

  getTaskInfo(taskname: string): Promise<{}> {
    const url = `${this.apiUrl}/tasks/${taskname}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }


  create(model: any): Promise<{}> {
    const url = `${this.apiUrl}/tasks`;
    return this.http
      .post(url, model,
        { headers: this.headers })
      .toPromise()
      .then(res => res.json())
      .catch(this.handleError);
  }

  run(taskname: string, runtime: string): Promise<{}> {
    const url = `${this.apiUrl}/tasks/${taskname}/run`;
    return this.http
      .post(url, { runtime: runtime },
        { headers: this.headers })
      .toPromise()
      .then(res => res.json())
      .catch(this.handleError);
  }

  delete(taskname: string, runtime: string): Promise<void> {
    const url = `${this.apiUrl}/tasks/${taskname}`;
    return this.http.delete(url, { body: { runtime: runtime }})
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }
}
