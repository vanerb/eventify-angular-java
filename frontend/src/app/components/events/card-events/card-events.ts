import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {getImage, transformDate} from '../../../services/utilities-service';
import {NgForOf, NgIf, SlicePipe} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {Event} from '../../../models/events';
import {User} from '../../../models/users';

@Component({
  selector: 'app-card-events',
  imports: [
    NgForOf,
    NgIf,
    SlicePipe,
    MatMenuModule
  ],
  templateUrl: './card-events.html',
  styleUrl: './card-events.css',
  standalone: true
})
export class CardEvents {
  @Input() event!: Event
  @Input() user!: User
  @Input() view: 'small' | 'complete' = 'complete'
  @Input() realOnly: boolean = false;

  @Output() actions = new EventEmitter()

  constructor(private readonly cd: ChangeDetectorRef) {
  }

  showDescriptionFull: boolean = false

  isParticipant(): boolean {
    return !!this.user?.id && ( this.event?.participants?.some(participant => participant.id === this.user.id) === true);
  }


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
  protected readonly getImage = getImage;
}
