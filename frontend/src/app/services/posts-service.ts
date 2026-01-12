import { Injectable } from '@angular/core';
import {AuthService} from './auth-service';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

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

  getById(id: string){
    return this.http.get<any[]>(`${this.url}/findById/${id}`)
  }

  getAll(page: number = 0, size: number = 20){
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any[]>(`${this.url}/getAll`, {params})
  }

  getMyPosts(page: number = 0, size: number = 20){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any[]>(`${this.url}/findByUserId`,{params, headers: headers})
  }

  delete(eventId: string){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.delete<any[]>(`${this.url}/delete/${eventId}`,{headers})
  }

}
