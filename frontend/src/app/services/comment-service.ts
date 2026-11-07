import { Injectable } from '@angular/core';
import {AuthService} from './auth-service';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class CommentService {
  url = environment.apiUrl + '/api/comments';

  constructor(private readonly authService: AuthService, private http: HttpClient) {
  }


  create(data: FormData){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.post<any>(`${this.url}/create`, data, {headers});
  }

  delete(id: number){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.delete<any>(`${this.url}/delete/${id}`, {headers});
  }
}
