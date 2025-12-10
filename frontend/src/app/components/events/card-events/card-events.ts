import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatChipRow} from '@angular/material/chips';
import {transformDate} from '../../../services/utilities-service';
import {NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-card-events',
  imports: [
    MatCardModule,
    MatChipRow,
    NgForOf,
    NgIf,
    MatButton
  ],
  templateUrl: './card-events.html',
  styleUrl: './card-events.css',
  standalone: true
})
export class CardEvents {
  @Input() event!: any
  @Input() user!: any

  @Output() actions = new EventEmitter()

  delete(){
    this.actions.emit({
      action: 'delete',
      event: this.event,
      user: this.user,
    })
  }

  edit(){
    this.actions.emit({
      action: 'edit',
      event: this.event,
      user: this.user,
    })
  }

  show(){
    this.actions.emit({
      action: 'show',
      event: this.event,
      user: this.user,
    })
  }

  protected readonly transformDate = transformDate;
}
