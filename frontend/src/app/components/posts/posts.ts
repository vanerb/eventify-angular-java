import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Container} from '../general/container/container';
import {CardEvents} from '../events/card-events/card-events';
import {NgForOf, NgIf} from '@angular/common';
import {ModalService} from '../../services/modal-service';
import {PostsService} from '../../services/posts-service';
import {CreatePostModal} from './create-post-modal/create-post-modal';
import {EventSevice} from '../../services/event-sevice';
import {CardPosts} from './card-posts/card-posts';
import {firstValueFrom} from 'rxjs';
import {AuthService} from '../../services/auth-service';
import {ShowPostModal} from './show-post-modal/show-post-modal';
import {WarningModal} from '../general/warning-modal/warning-modal';
import {Post} from '../../models/posts';
import {User} from '../../models/users';

@Component({
  selector: 'app-posts',
  imports: [Container, CardEvents, NgForOf, NgIf, CardPosts],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
  standalone: true
})
export class Posts implements OnInit, AfterViewInit{
  myEvents: Event[] = []
  myPosts: Post[] = []
  joinedEvents: Event[] = []
  user!: User
  posts: Post[] = []

  @Input() view: 'general' | 'my' = 'general'


  constructor(private readonly modalService: ModalService, private readonly postService: PostsService, private eventService: EventSevice, private authService: AuthService, private readonly cd: ChangeDetectorRef) {
  }

  async ngOnInit() {
    if(this.authService.getToken()){
      this.user = await firstValueFrom(this.authService.getUserByToken())
    }



  }

  ngAfterViewInit() {
   this.updateView()

  }

  updateView(){
    if(this.view === 'general'){
      this.getAllPosts()
      this.getMyEvents()
    }
    else{
      this.getMyEvents()
      this.getMyPosts()
    }
  }

  getMyEvents(){
    this.eventService.getMyEventParticipations().subscribe((events) => {
      this.myEvents = events;
      this.cd.detectChanges()
    })
  }


  createPost(){
      this.modalService.open(CreatePostModal, {
        width: '180vh',
        height: '90vh',
      },{
        events: this.myEvents
      }).then( (item: FormData) => {
        this.postService.create(item).subscribe(() => {
          this.updateView()
        })
      })
        .catch(() => {
          this.modalService.close()
          this.updateView()
        });

  }


  getMyPosts(){
    this.postService.getMyPosts().subscribe((posts) => {
      this.myPosts = posts
      this.cd.detectChanges()
    })
  }

  getAllPosts(){
    this.postService.getAll().subscribe((posts) => {
      this.posts = posts
      this.cd.detectChanges()
    })
  }

  postActions(data: any){
    if(data){
      switch (data.action){

        case 'show':
          this.show(data.post)
          break

        case 'delete':
          this.delete(data.post)
          break

      }
    }
  }

  delete(post: any){
    this.modalService.open(WarningModal, {
        width: '60vh',
      },
      {
        props: {
          title: 'Eliminar',
          message: '¿Está seguro de que quiere eliminar el post?',
          type: 'delete'
        }

      }).then( (item: FormData) => {
      this.postService.delete(post.id).subscribe(()=>{
        this.updateView()
      })
    })
      .catch(() => {
        this.modalService.close()
      });
  }



  show(post: any) {
    this.modalService.open(ShowPostModal, {
        width: '180vh',
        height: '90vh',
      },
      {
        post: post,
        user: this.user
      }).then(async (item: any) => {

    })
      .catch(() => {
        this.modalService.close()
        this.updateView()
      });
  }
}
