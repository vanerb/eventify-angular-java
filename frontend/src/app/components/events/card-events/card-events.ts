import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatChipRow} from '@angular/material/chips';
import {sleep, transformDate} from '../../../services/utilities-service';
import {NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-card-events',
  imports: [
    MatCardModule,
    MatChipRow,
    NgForOf,
    NgIf,
    MatButton,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './card-events.html',
  styleUrl: './card-events.css',
  standalone: true
})
export class CardEvents {
  @Input() event!: any
  @Input() user!: any
  @Input() view: 'small' | 'complete' = 'complete'
  @Input() realOnly: boolean = false;

  @Output() actions = new EventEmitter()

  constructor(private readonly cd: ChangeDetectorRef) {
  }

  showDescriptionFull: boolean = false


  viewMore() {
    this.showDescriptionFull = !this.showDescriptionFull
    this.cd.detectChanges()
  }


  delete() {
    this.actions.emit({
      action: 'delete',
      event: this.event,
      user: this.user,
    })
  }

  edit() {
    this.actions.emit({
      action: 'edit',
      event: this.event,
      user: this.user,
    })
  }

  show() {
    this.actions.emit({
      action: 'show',
      event: this.event,
      user: this.user,
    })
  }

  join() {
    this.actions.emit({
      action: 'join',
      event: this.event,
      user: this.user,
    })
  }

  protected readonly transformDate = transformDate;
}
