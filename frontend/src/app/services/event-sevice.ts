import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
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


   getAll(page: number = 0, size: number = 20){
     let params = new HttpParams()
       .set('page', page.toString())
       .set('size', size.toString());

     return this.http.get<any[]>('http://localhost:8080/api/events/getAll', { params })
   }

  getMyEventParticipations(page: number = 0, size: number = 20){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any[]>('http://localhost:8080/api/events/findMyEventParticipations',{params, headers: headers})
  }

  getMyEvents(page: number = 0, size: number = 20){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any[]>('http://localhost:8080/api/events/findByUserId',{params, headers: headers})
  }

  joinEvent(eventId: string, userId: number){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.post<any[]>('http://localhost:8080/api/events/'+eventId+'/join/'+userId,{headers})
  }

  delete(eventId: string){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.delete<any[]>('http://localhost:8080/api/events/delete/'+eventId,{headers})
  }

  update(id: string, data: FormData){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.post<any>(`${this.url}/update/${id}`, data, {headers});
  }
}
