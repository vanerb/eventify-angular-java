import { Component, OnInit, signal } from '@angular/core';
import { CardEvents } from '../../events/card-events/card-events';
import { NgForOf, NgIf } from '@angular/common';
import { getImage, transformDate } from '../../../services/utilities-service';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../services/comment-service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { PostsService } from '../../../services/posts-service';
import { Post } from '../../../models/posts';
import { User } from '../../../models/users';

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

  post!: Post;
  user!: User;

  comment = signal<string>('');

  activeTab = signal<'comments' | 'event' | 'participants'>('comments');

  confirm!: (result?: any) => void;
  close!: () => void;

  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostsService
  ) {}

  ngOnInit(): void {
    console.log(this.post, this.user);
  }

  selectTab(tab: 'comments' | 'event' | 'participants'): void {
    this.activeTab.set(tab);
  }

  sendComment(): void {
    const currentPost = this.post;
    const currentUser = this.user;
    const currentComment = this.comment();

    if (!currentPost || !currentUser || !currentComment.trim()) {
      return;
    }

    const comment = {
      comment: currentComment,
      user: currentUser,
      post: currentPost,
    };

    const formData = new FormData();

    formData.append(
      'comment',
      new Blob(
        [JSON.stringify(comment)],
        { type: 'application/json' }
      )
    );

    this.commentService.create(formData).subscribe({
      next: () => {
        this.comment.set('');
        this.getPostById(currentPost.id);
      },
    });
  }

  getPostById(id: number): void {
    this.postService.getById(id).subscribe({
      next: (post) => {
        this.post = post;
      },
    });
  }

  delete(id: number): void {
    const currentPost = this.post;

    if (!currentPost) {
      return;
    }

    this.commentService.delete(id).subscribe({
      next: () => {
        this.getPostById(currentPost.id);
      },
    });
  }

  protected readonly transformDate = transformDate;
  protected readonly getImage = getImage;
}