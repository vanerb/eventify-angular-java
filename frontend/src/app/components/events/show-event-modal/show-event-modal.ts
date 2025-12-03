import {Component, Input, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {ImagesService} from '../../../services/images-service';
import {MatChipRow} from '@angular/material/chips';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-show-event-modal',
  imports: [
    MatButton,
    MatChipRow,
    NgForOf
  ],
  templateUrl: './show-event-modal.html',
  styleUrl: './show-event-modal.css',
  standalone: true
})
export class ShowEventModal implements OnInit{

  @Input() ubication: any

  confirm!: (result?: any) => void;
  close!: () => void;

  bannerImage!: any[]

  constructor(private readonly imagesService: ImagesService) {
  }

  async ngOnInit() {
    console.log("AAAAA", this.ubication)
    if (this.ubication.headerImageName) {
      this.bannerImage = await this.imagesService.getImage(this.ubication.id, 'event')
    } else {

    }

  }


  join(){
    this.confirm();
  }


}
