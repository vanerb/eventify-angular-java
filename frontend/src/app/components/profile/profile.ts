import {Component, OnInit} from '@angular/core';
import {Container} from '../general/container/container';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDividerModule} from '@angular/material/divider';
import {AuthService} from '../../services/auth-service';
import {firstValueFrom} from 'rxjs';
import {Posts} from '../posts/posts';
import {Events} from '../events/events';
import {NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {ModalService} from '../../services/modal-service';
import {UpdateUserModal} from './update-user-modal/update-user-modal';
import {getImage} from '../../services/utilities-service';

@Component({
  selector: 'app-profile',
  imports: [Container, MatTabsModule, MatDividerModule, Posts, Events, NgIf, MatButton],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true
})
export class Profile implements OnInit{

  user: any

  constructor(private readonly authService: AuthService, private readonly modalService: ModalService) {
  }

  async ngOnInit() {

    await this.updateUser()

    console.log("AAAAA",this.user)
  }


  async updateUser() {
    this.user = await firstValueFrom(this.authService.getUserByToken())
  }


  updateProfile(){
    this.modalService.open(UpdateUserModal, {
      width: '180vh',
      height: '90vh',
    },{
      user: this.user
    }).then(async (item: FormData) => {

      this.authService.update(item).subscribe({
        next: async (message) => {
          await this.updateUser()

        },
        error: error => {
          console.log(error)
        }
      })

    })
      .catch(() => {
        this.modalService.close()

      });
  }

  protected readonly getImage = getImage;
}
