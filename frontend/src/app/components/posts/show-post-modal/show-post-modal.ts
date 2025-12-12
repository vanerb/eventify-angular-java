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
    MatTabGroup
  ],
  templateUrl: './show-post-modal.html',
  styleUrl: './show-post-modal.css',
  standalone: true,

})
export class ShowPostModal implements OnInit {

  post!:any
  user!:any

  confirm!: (result?: any) => void;
  close!: () => void;



  ngOnInit() {

    console.log(this.post)
  }

  protected readonly transformDate = transformDate;
}
