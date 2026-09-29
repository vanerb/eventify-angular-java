import {Component, Input, OnInit, signal} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {getImage, transformDate} from '../../../services/utilities-service';
import {User} from '../../../models/users';

@Component({
  selector: 'app-show-event-modal',
  imports: [NgForOf, NgIf],
  templateUrl: './show-event-modal.html',
  styleUrl: './show-event-modal.css',
  standalone: true
})
export class ShowEventModal implements OnInit {

  @Input() ubication: any;

  @Input() user!: User;

  confirm!: (result?: any) => void;

  close!: () => void;

  activeTab = signal<'description' | 'participants'>('description');

  imageUnavailable = signal<boolean>(false);

  ngOnInit() {}

  join() {
    this.confirm();
  }

  selectTab(tab: 'description' | 'participants') {
    this.activeTab.set(tab);
  }

  isParticipant(): boolean {

    return !!this.user?.id &&
      (
        this.ubication?.creator?.id === this.user.id ||
        this.ubication?.participants?.some(
          (participant: User) =>
            participant.id === this.user.id
        ) === true
      );
  }

  onImageError(event: Event) {

    this.imageUnavailable.set(true);

    (event.target as HTMLImageElement).src = getImage(null);
  }

  protected readonly transformDate = transformDate;

  protected readonly getImage = getImage;
}