import {Component, OnInit} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButton} from '@angular/material/button';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth-service';
import {firstValueFrom} from 'rxjs';
import {cleanUrlImage} from '../../services/utilities-service';
import {ImagesService} from '../../services/images-service';

@Component({
  selector: 'app-header',
  imports: [
    NgClass,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatButton,
    NgIf,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true
})
export class Header implements OnInit {

  isOpen: boolean = false
  isLogged: boolean = false;
  drawerMode: 'side' | 'over' = 'side';
  user!: any


  constructor(
    private readonly authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private imagesService: ImagesService,
  ) {

  }

  async ngOnInit() {
    this.isLogged = this.authService.isLoggedIn()
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        if (result.matches) {
          this.drawerMode = 'over';
          this.isOpen = false; // se cierra al cambiar a móvil
        } else {
          this.drawerMode = 'side';
        }
      });


    if (this.authService.getToken()) {
      this.user = await firstValueFrom(this.authService.getUserByToken()) || null
    } else {

    }
  }

  gotTo(url: string) {

    this.router.navigate([url])
  }

  open() {
    this.isOpen = !this.isOpen
  }

  onDrawerClosed() {
    this.isOpen = false;
  }

  async closeSession() {
    await this.authService.logout()
    window.location.reload();
    this.isOpen = false
  }
}
