// auth.guard.ts
import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {AuthService} from '../services/auth-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const isLoggedIn = this.auth.isLoggedIn();
    const publicRoutes = ['login', 'register'];

    const currentRoute = route.routeConfig?.path;

    if (isLoggedIn) {
      // Si está logueado y va a login/register, redirige al home
      if (currentRoute && publicRoutes.includes(currentRoute)) {
        return this.router.createUrlTree(['/events']);
      }
      return true; // deja pasar
    } else {
      // Si no está logueado y va a ruta privada, redirige a login
      if (!currentRoute || !publicRoutes.includes(currentRoute)) {
        return this.router.createUrlTree(['/login']);
      }
      return true; // ruta pública, deja pasar
    }
  }
}
