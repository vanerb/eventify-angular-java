import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-card-posts',
  imports: [],
  templateUrl: './card-posts.html',
  styleUrl: './card-posts.css',
  standalone: true
})
export class CardPosts {
  @Input() post!: any
  @Input() user!:any
  @Output() actions = new EventEmitter()



  view(){
    this.actions.emit({
      action: 'show',
      post: this.post,
    })
  }
}
