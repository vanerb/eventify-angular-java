import { Routes } from '@angular/router';
import {Index} from './components/index';
import {Login} from './components/login/login';
import {Contact} from './components/contact/contact';
import {Register} from './components/register/register';
import {Profile} from './components/profile/profile';
import {Chats} from './components/chats/chats';

export const routes: Routes = [
  {path: '', component: Index},
  {path: 'login', component: Login},
  {path: 'contact', component: Contact},
  {path: 'register', component: Register},
  {path: 'profile', component: Profile},
  {path: 'chats', component: Chats},
  {path: '**', redirectTo: 'login'}
];
