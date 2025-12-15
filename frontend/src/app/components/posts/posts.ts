import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Container} from '../general/container/container';
import {CardEvents} from '../events/card-events/card-events';
import {NgForOf, NgIf} from '@angular/common';
import {CreateEventModal} from '../events/create-event-modal/create-event-modal';
import {ModalService} from '../../services/modal-service';
import {PostsService} from '../../services/posts-service';
import {CreatePostModal} from './create-post-modal/create-post-modal';
import {EventSevice} from '../../services/event-sevice';
import {CardPosts} from './card-posts/card-posts';
import {firstValueFrom} from 'rxjs';
import {AuthService} from '../../services/auth-service';
import {After} from 'node:v8';
import {ShowEventModal} from '../events/show-event-modal/show-event-modal';
import {ShowPostModal} from './show-post-modal/show-post-modal';
import {WarningModal} from '../general/warning-modal/warning-modal';

@Component({
  selector: 'app-posts',
  imports: [Container, CardEvents, NgForOf, NgIf, CardPosts],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
  standalone: true
})
export class Posts implements OnInit, AfterViewInit{
  myEvents: any[] = []
  myPosts: any[] = []
  user!: any
  posts: any[] = []


  constructor(private readonly modalService: ModalService, private readonly postService: PostsService, private eventService: EventSevice, private authService: AuthService) {
  }

  async ngOnInit() {
    this.user = await firstValueFrom(this.authService.getUserByToken())


  }

  ngAfterViewInit() {
    this.getMyEvents()
    this.getAllPosts()
  }

  getMyEvents(){
    this.eventService.getMyEventParticipations().subscribe((events) => {
      this.myEvents = events;
    })
  }


  createPost(){

      this.modalService.open(CreatePostModal, {
        width: '180vh',
        height: '90vh',
      },{
        events: this.myEvents
      }).then(async (item: FormData) => {
        this.postService.create(item).subscribe({
          next: () => {
            this.getMyPosts()
          },
          error: error => {
            console.log(error)
          }
        })

      })
        .catch(() => {
          this.modalService.close()
          this.getAllPosts()
        });

  }


  getMyPosts(){
    this.postService.getMyPosts().subscribe((posts) => {
      this.myPosts = posts
    })
  }

  getAllPosts(){
    this.postService.getAll().subscribe((posts) => {
      this.posts = posts

      console.log("AAA",this.posts)
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

      }).then(async (item: FormData) => {


      this.postService.delete(post.id).subscribe({
        next: (message) => {
          this.getAllPosts()
          console.log(message)
        },
        error: (err) => {

        }
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
        this.getAllPosts()
      });
  }
}
