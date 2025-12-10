import {Component, OnInit} from '@angular/core';
import {Container} from '../general/container/container';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDividerModule} from '@angular/material/divider';
import {AuthService} from '../../services/auth-service';
import {firstValueFrom} from 'rxjs';
import {Posts} from '../posts/posts';
import {Events} from '../events/events';

@Component({
  selector: 'app-profile',
  imports: [Container, MatTabsModule, MatDividerModule, Posts, Events],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true
})
export class Profile implements OnInit{

  user: any

  constructor(private readonly authService: AuthService) {
  }


  async ngOnInit() {
    this.user = await firstValueFrom(this.authService.getUserByToken())
  }

}
