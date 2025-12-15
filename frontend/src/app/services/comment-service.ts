import { Injectable } from '@angular/core';
import {AuthService} from './auth-service';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  url = 'http://localhost:8080/api/comments';

  constructor(private readonly authService: AuthService, private http: HttpClient) {
  }


  create(data: FormData){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.post<any>(`${this.url}/create`, data, {headers});
  }

  delete(id: string){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.delete<any>(`${this.url}/delete/${id}`, {headers});
  }
}
