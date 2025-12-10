import { Injectable } from '@angular/core';
import {AuthService} from './auth-service';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PostsService {

  url = 'http://localhost:8080/api/posts';

  constructor(private readonly authService: AuthService, private http: HttpClient) {
  }


  create(data: FormData){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.post<any>(`${this.url}/create`, data, {headers});
  }


  getAll(){
    return this.http.get<any[]>(`${this.url}/getAll`)
  }

  getMyPosts(){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.get<any[]>(`${this.url}/findByUserId`,{headers})
  }

  delete(eventId: string){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.delete<any[]>(`${this.url}/delete/${eventId}`,{headers})
  }

}
