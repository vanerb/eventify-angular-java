import './polyfills'; // 👈 debe ir primero
import 'zone.js';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { App } from './app/app';
import { environment } from './environments/environment';
import { demoBackendInterceptor } from './app/demo/demo-backend.interceptor';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withFetch(), withInterceptors(environment.demo ? [demoBackendInterceptor] : [])),
    provideRouter(routes),
    provideClientHydration(),
  ],
}).catch(err => console.error(err));
