import {Component, Input, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {ImagesService} from '../../../services/images-service';
import {MatChipRow} from '@angular/material/chips';
import {NgForOf} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {transformDate} from '../../../services/utilities-service';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';

@Component({
  selector: 'app-show-event-modal',
  imports: [
    MatButton,
    MatChipRow,
    NgForOf,
    MatTabsModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './show-event-modal.html',
  styleUrl: './show-event-modal.css',
  standalone: true
})
export class ShowEventModal implements OnInit{

  @Input() ubication: any

  confirm!: (result?: any) => void;
  close!: () => void;



  constructor(private readonly imagesService: ImagesService) {
  }

  async ngOnInit() {


  }


  join(){
    this.confirm();
  }


  protected readonly transformDate = transformDate;
}
