import {Component, OnInit, signal} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButton} from '@angular/material/button';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth-service';
import {firstValueFrom} from 'rxjs';
import {getImage} from '../../services/utilities-service';
import {ImagesService} from '../../services/images-service';
import {User} from '../../models/users';

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

  isOpen = signal<boolean>(false);

  isLogged = signal<boolean>(false);

  drawerMode = signal<'side' | 'over'>('side');

  user = signal<User | undefined>(undefined);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly imagesService: ImagesService,
  ) {}

  async ngOnInit(): Promise<void> {

    this.isLogged.set(
      this.authService.isLoggedIn()
    );

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe(result => {

        if (result.matches) {

          this.drawerMode.set('over');
          this.isOpen.set(false);

        } else {

          this.drawerMode.set('side');

        }

      });

    if (this.authService.getToken()) {

      const user = await firstValueFrom(
        this.authService.getUserByToken()
      );

      this.user.set(user || undefined);

    }
  }

  gotTo(url: string): void {
    this.router.navigate([url]);
  }

  open(): void {
    this.isOpen.update(
      isOpen => !isOpen
    );
  }

  onDrawerClosed(): void {
    this.isOpen.set(false);
  }

  async closeSession(): Promise<void> {

    await this.authService.logout();

    this.isLogged.set(false);
    this.user.set(undefined);
    this.isOpen.set(false);

    window.location.reload();
  }

  protected readonly getImage = getImage;
}