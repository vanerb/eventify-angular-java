import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CardEvents} from '../../events/card-events/card-events';
import {NgForOf, NgIf} from '@angular/common';
import {getImage, transformDate} from '../../../services/utilities-service';
import {FormsModule} from "@angular/forms";
import {CommentService} from '../../../services/comment-service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {PostsService} from '../../../services/posts-service';
import {Post} from '../../../models/posts';
import {User} from '../../../models/users';

@Component({
  selector: 'app-show-post-modal',
  imports: [
    CardEvents,
    NgForOf,
    NgIf,
    FormsModule,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
  templateUrl: './show-post-modal.html',
  styleUrl: './show-post-modal.css',
  standalone: true,

})
export class ShowPostModal implements OnInit {

  post!:Post
  user!:User
  comment: string = ""
  activeTab: 'comments' | 'event' | 'participants' = 'comments';

  confirm!: (result?: any) => void;
  close!: () => void;

  constructor(private readonly commentService: CommentService, private readonly postService: PostsService, private readonly cd: ChangeDetectorRef) {
  }



  ngOnInit() {

    console.log(this.post, this.user)
  }

  selectTab(tab: 'comments' | 'event' | 'participants') {
    this.activeTab = tab;
    this.cd.detectChanges();
  }

  sendComment(){

    let comment: any = {
      comment: this.comment,
      user: this.user,
      post: this.post
    }

    let formData = new FormData();
    formData.append('comment', new Blob([JSON.stringify(comment)], { type: 'application/json' }));

    this.commentService.create(formData).subscribe({
      next: async () => {
        this.comment = ""

        this.getPostById(this.post.id)

      }
    })

  }

  getPostById(id: number){
    this.postService.getById(id).subscribe({
      next: async (post) => {
        this.post = post

      }
    })
  }

  delete(id: number){
    this.commentService.delete(id).subscribe({
      next: async () => {
        this.getPostById(this.post.id)

      }
    })
  }

  protected readonly transformDate = transformDate;
  protected readonly getImage = getImage;
}
