import { Component, Input, OnInit, signal } from '@angular/core';
import { Container } from '../general/container/container';
import { CardEvents } from '../events/card-events/card-events';
import { NgForOf, NgIf } from '@angular/common';
import { ModalService } from '../../services/modal-service';
import { PostsService } from '../../services/posts-service';
import { CreatePostModal } from './create-post-modal/create-post-modal';
import { EventSevice } from '../../services/event-sevice';
import { CardPosts } from './card-posts/card-posts';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { ShowPostModal } from './show-post-modal/show-post-modal';
import { WarningModal } from '../general/warning-modal/warning-modal';
import { Post, PostPage } from '../../models/posts';
import { User } from '../../models/users';
import { Paginator } from '../general/paginator/paginator';

@Component({
  selector: 'app-posts',
  imports: [Container, CardEvents, NgForOf, NgIf, CardPosts, Paginator],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
  standalone: true,
})
export class Posts implements OnInit {
  myPosts = signal<Post[]>([]);
  posts = signal<Post[]>([]);

  user = signal<User | undefined>(undefined);

  page = signal<number>(0);
  limit = signal<number>(20);

  postPagination = signal<PostPage | null>(null);

  @Input() view: 'general' | 'my' = 'general';

  constructor(
    private readonly modalService: ModalService,
    private readonly postService: PostsService,
    private readonly eventService: EventSevice,
    private readonly authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.authService.getToken()) {
      const user = await firstValueFrom(
        this.authService.getUserByToken()
      );

      this.user.set(user);
    }

    this.updateView();
  }

  updatePagination(page: number, limit: number): void {
    this.page.set(page);
    this.limit.set(limit);

    this.updateView();
  }

  updateView(): void {
    if (this.view === 'general') {
      this.getAllPosts();
    } else {
      this.getMyPosts();
    }
  }

  createPost(): void {
    this.modalService
      .open(
        CreatePostModal,
        {
          width: '180vh',
          height: '90vh',
        },
        {},
      )
      .then((item: FormData) => {
        this.postService.create(item).subscribe(() => {
          this.updateView();
        });
      })
      .catch(() => {
        this.modalService.close();
        this.updateView();
      });
  }

  getMyPosts(): void {
    this.postService
      .getMyPosts(this.page(), this.limit())
      .subscribe((posts: PostPage) => {
        this.myPosts.set(posts.content);
        this.postPagination.set(posts);
      });
  }

  getAllPosts(): void {
    this.postService
      .getAll(this.page(), this.limit())
      .subscribe((posts: PostPage) => {
        this.posts.set(posts.content);
        this.postPagination.set(posts);
      });
  }

  postActions(data: any): void {
    if (data) {
      switch (data.action) {
        case 'show':
          this.show(data.post);
          break;

        case 'delete':
          this.delete(data.post);
          break;
      }
    }
  }

  delete(post: any): void {
    this.modalService
      .open(
        WarningModal,
        {
          width: '60vh',
        },
        {
          props: {
            title: 'Eliminar',
            message: '¿Está seguro de que quiere eliminar el post?',
            type: 'delete',
          },
        },
      )
      .then((item: FormData) => {
        this.postService.delete(post.id).subscribe(() => {
          this.updateView();
        });
      })
      .catch(() => {
        this.modalService.close();
      });
  }

  show(post: any): void {
    this.modalService
      .open(
        ShowPostModal,
        {
          width: 'min(960px, 94vw)',
          height: 'min(780px, calc(100dvh - 32px))',
        },
        {
          post: post,
          user: this.user(),
        },
      )
      .then(async (item: any) => {})
      .catch(() => {
        this.modalService.close();
        this.updateView();
      });
  }
}