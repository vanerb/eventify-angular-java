import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = 'http://localhost:8080/api/auth/';

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


  login(data: FormData){
    return this.http.post<any>(this.url+'login', data, {})
  }

  register(user: FormData) {
    return this.http.post<any>(this.url + 'register', user)
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
    return this.http.get<any>(this.url+'user', {headers})
  }

  update( formData: FormData) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    });
    return this.http.post<any>(this.url+'update', formData, {headers})
  }
}
