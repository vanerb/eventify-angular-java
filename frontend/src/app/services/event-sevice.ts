import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class EventSevice {
   url = 'http://localhost:8080/api/events';

   constructor(private readonly authService: AuthService, private http: HttpClient) {
   }


   create(data: FormData){
     const headers = new HttpHeaders({
       Authorization: `Bearer ${this.authService.getToken()}`
     });
     return this.http.post<any>(`${this.url}/create`, data, {headers});
   }
}
