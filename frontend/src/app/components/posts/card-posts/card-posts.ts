import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {NgIf} from "@angular/common";
import {getImage} from "../../../services/utilities-service";
import {Post} from '../../../models/posts';
import {User} from '../../../models/users';

@Component({
  selector: 'app-card-posts',
  imports: [
    MatButton,
    MatMenu,
    MatMenuItem,
    NgIf,
    MatMenuTrigger
  ],
  templateUrl: './card-posts.html',
  styleUrl: './card-posts.css',
  standalone: true
})
export class CardPosts {
  @Input() post!: Post
  @Input() user!:User
  @Output() actions = new EventEmitter()



  view(){
    this.actions.emit({
      action: 'show',
      post: this.post,
    })
  }

  delete(){
    this.actions.emit({
      action: 'delete',
      post: this.post,
    })
  }

    protected readonly getImage = getImage;
}
