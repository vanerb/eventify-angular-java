import {Component, OnInit, signal} from '@angular/core';
import {Container} from '../general/container/container';
import {MatTabsModule} from '@angular/material/tabs';
import {AuthService} from '../../services/auth-service';
import {firstValueFrom} from 'rxjs';
import {Posts} from '../posts/posts';
import {Events} from '../events/events';
import {NgIf} from '@angular/common';
import {ModalService} from '../../services/modal-service';
import {UpdateUserModal} from './update-user-modal/update-user-modal';
import {getImage} from '../../services/utilities-service';
import {User} from '../../models/users';

@Component({
  selector: 'app-profile',
  imports: [Container, MatTabsModule, Posts, Events, NgIf],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true
})
export class Profile implements OnInit {

  user = signal<User | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: ModalService
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.updateUser();

    console.log('AAAAA', this.user());
  }

  async updateUser(): Promise<void> {
    const user = await firstValueFrom(
      this.authService.getUserByToken()
    );

    this.user.set(user);
  }

  updateProfile(): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.modalService.open(
      UpdateUserModal,
      {
        width: '180vh',
        height: '90vh',
      },
      {
        user: currentUser
      }
    )
      .then(async (item: FormData) => {

        this.authService.update(item).subscribe({
          next: async (message) => {
            await this.updateUser();
          },
          error: error => {
            console.log(error);
          }
        });

      })
      .catch(() => {
        this.modalService.close();
      });
  }

  protected readonly getImage = getImage;
}