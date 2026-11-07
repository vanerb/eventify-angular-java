import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {AuthService} from './auth-service';
import {EventPage} from '../models/events';

import { environment } from '../../environments/environment';
export interface EventFilters {
  category?: string;
  search?: string;
  type?: string;
  location?: string;
  fromDate?: string;
  toDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventSevice {
   url = environment.apiUrl + '/api/events';

   constructor(private readonly authService: AuthService, private http: HttpClient) {
   }


   create(data: FormData){
     const headers = new HttpHeaders({
       Authorization: `Bearer ${this.authService.getToken()}`
     });
     return this.http.post<Event>(`${this.url}/create`, data, {headers});
   }


   getAll(page: number = 0, size: number = 20, filters: EventFilters = {}){
     let params = new HttpParams()
       .set('page', page.toString())
       .set('size', size.toString());

     Object.entries(filters).forEach(([key, value]) => {
       if (value) params = params.set(key, value);
     });

     return this.http.get<EventPage>(environment.apiUrl + '/api/events/getAll', { params })
   }

  getMyEventParticipations(page: number = 0, size: number = 20, search: string = ""){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())

    if (search && search.trim().length > 0) {
      params = params.set('search', search);
    }

    return this.http.get<EventPage>(environment.apiUrl + '/api/events/findMyEventParticipations',{params, headers: headers})
  }

  getMyEvents(page: number = 0, size: number = 20){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<EventPage>(environment.apiUrl + '/api/events/findByUserId',{params, headers: headers})
  }

  joinEvent(eventId: string, userId: number){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.post<Event>(environment.apiUrl + '/api/events/'+eventId+'/join/'+userId,{headers})
  }

  delete(eventId: string){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.delete<Event>(environment.apiUrl + '/api/events/delete/'+eventId,{headers})
  }

  update(id: string, data: FormData){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
    return this.http.post<Event>(`${this.url}/update/${id}`, data, {headers});
  }
}
