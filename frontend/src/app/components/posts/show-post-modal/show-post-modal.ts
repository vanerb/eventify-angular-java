import {Component, Input, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {CardEvents} from '../../events/card-events/card-events';
import {MatCardModule} from '@angular/material/card';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatChipRow} from '@angular/material/chips';
import {NgForOf, NgIf} from '@angular/common';
import {transformDate} from '../../../services/utilities-service';
import {MatDivider} from '@angular/material/divider';
import {MatList, MatListItem} from '@angular/material/list';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {FormsModule} from "@angular/forms";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {CommentService} from '../../../services/comment-service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {PostsService} from '../../../services/posts-service';

@Component({
  selector: 'app-show-post-modal',
  imports: [
    MatButton,
    CardEvents,
    MatCardModule,
    MatAccordion,
    MatChipRow,
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    NgForOf,
    NgIf,
    MatDivider,
    MatList,
    MatListItem,
    MatTab,
    MatTabGroup,
    FormsModule,
    MatFormField,
    MatInput,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
  templateUrl: './show-post-modal.html',
  styleUrl: './show-post-modal.css',
  standalone: true,

})
export class ShowPostModal implements OnInit {

  post!:any
  user!:any
  comment: string = ""

  confirm!: (result?: any) => void;
  close!: () => void;

  constructor(private readonly commentService: CommentService, private readonly postService: PostsService) {
  }



  ngOnInit() {

    console.log(this.post, this.user)
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

  getPostById(id: string){
    this.postService.getById(id).subscribe({
      next: async (post) => {
        this.post = post

      }
    })
  }

  delete(id: string){
    this.commentService.delete(id).subscribe({
      next: async () => {
        this.getPostById(this.post.id)

      }
    })
  }

  protected readonly transformDate = transformDate;
}
