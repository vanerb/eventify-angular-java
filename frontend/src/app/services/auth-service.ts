import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = 'http://localhost:8080/';

  constructor( private router: Router, private http: HttpClient) {}


  isLoggedIn(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  getToken() {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem('token');
  }

  setType(type: string){
    localStorage.setItem('type', type);
  }

  deleteType(){
    localStorage.removeItem('type');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getType(){

    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem('type');
  }


  login(data: any){
    return this.http.post<any>(this.url+'api/auth/login', data, {})
  }

  register(user: FormData) {
    return this.http.post<any>(this.url + 'api/auth/register', user)
  }

  async logout() {
    localStorage.removeItem('token');
    this.deleteType()
    await this.router.navigate(['/login'])
  }



  getUserByToken(){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    });
    return this.http.get<any>('http://localhost:8080/api/auth/user', {headers})
  }

  update( formData: FormData) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    });
    return this.http.post<any>('http://localhost:8080/api/auth/update', formData, {headers})
  }
}
