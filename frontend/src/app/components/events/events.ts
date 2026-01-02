import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Container} from '../general/container/container';
import {ModalService} from '../../services/modal-service';
import {CreateEventModal} from '../events/create-event-modal/create-event-modal';
import {EventSevice} from '../../services/event-sevice';
import {ShowEventModal} from '../events/show-event-modal/show-event-modal';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {formatDate, NgForOf, NgIf} from '@angular/common';
import {ImagesService} from '../../services/images-service';
import {sleep, transformDate} from '../../services/utilities-service';
import {MatChipRow} from '@angular/material/chips';
import {MatButton} from '@angular/material/button';
import {firstValueFrom} from 'rxjs';
import {AuthService} from '../../services/auth-service';
import {FormsModule} from '@angular/forms';
import {CardEvents} from './card-events/card-events';
import {User} from '../../models/users';
import {MapService} from '../../services/map-service';
import {UpdateEventModal} from './update-event-modal/update-event-modal';
import {WarningModal} from '../general/warning-modal/warning-modal';
import {Loader} from '../general/loader/loader';

@Component({
  selector: 'app-events',
  imports: [Container, MatButtonToggleModule, MatCardModule, NgIf, NgForOf, MatChipRow, MatButton, FormsModule, CardEvents],
  templateUrl: './events.html',
  styleUrl: './events.css',
  standalone: true
})
export class Events implements OnInit, AfterViewInit{
  map: any;
  events: any[] = [];
  myEvents: any[] = [];
  user!: User;
  selectedView: string = 'list';

  @Input() view: 'general' | 'my' = 'general';

  constructor(
    private readonly mapService: MapService,
    private readonly modalService: ModalService,
    private readonly eventService: EventSevice,
    private readonly imageService: ImagesService,
    private readonly authService: AuthService,
    private readonly cd: ChangeDetectorRef,
  ) {}

  async ngAfterViewInit() {
    if(this.authService.getToken()){
      this.user = await firstValueFrom(this.authService.getUserByToken());
    }


    await this.mapService.initLeaflet();

  }

  updateMap() { this.initMap(); }

  initMap(){
    this.map = this.mapService.createMap('map');

    this.mapService.onMapClick(async (lat, lng) => {
      this.mapService.getLocation(lat, lng).subscribe(data => {
        const displayName = data.display_name || 'Sin información';
        this.mapService.addMarker(lat, lng, displayName);
      });
    });

    this.loadEventMarkers();
  }

   ngOnInit() {
    this.updateView()
  }

  updateView(){
    if(this.view === 'general'){
      this.getAllEvents();
    }
    else{
      this.getAllMyEvents();
    }
  }

  getAllEvents() {
    this.eventService.getAll().subscribe(events => {
      this.events = events
      this.cd.detectChanges()
    });
  }

  getAllMyEvents() {
    this.eventService.getMyEvents().subscribe(events => {
      this.myEvents = events
      this.cd.detectChanges()
    });
  }

  loadEventMarkers() {
    this.eventService.getAll().subscribe(events => {
      this.mapService.addEventMarkers(events, (event) => {
        this.modalService.open(ShowEventModal, {
          width: '90vh',
          height: '90vh',
        }, { ubication: event, user: this.user }).catch(() => this.modalService.close());
      });
    });
  }

  createEvent() {
    this.modalService.open(CreateEventModal, { width: '90vh', height: '90vh' })
      .then(async (item: FormData) => {
        this.eventService.create(item).subscribe({
          next: () => {
            this.updateView()
          },
          error: err => console.log(err)
        });
      }).catch(() => this.modalService.close());
  }


  eventActions(data: any) {
    if (data) {
      switch (data.action) {
        case 'delete':
          this.delete(data.event);
          break;
        case 'show':
          this.show(data.event);
          break;
        case 'edit':
          this.edit(data.event);
          break;
        case 'join':
          this.join(data.event);
          break;
      }
    }
  }

  join(event: any) {
    this.modalService.open(WarningModal, { width: '60vh' }, {
      props: {
        title: 'Confirmación',
        message: `¿Está seguro de que quiere unirse al evento ${event.name}?`,
        type: 'delete'
      }
    }).then(() => {
      this.eventService.joinEvent(event.id, this.user.id).subscribe(result => {
        console.log(result);
        this.updateView()
      });
    }).catch(() => this.modalService.close());
  }

  show(event: any) {
    this.modalService.open(ShowEventModal, { width: '90vh', height: '90vh' }, { ubication: event, user: this.user })
      .then(() => {
        this.join(event);
      }).catch(() => this.modalService.close());
  }

  delete(event: any) {
    this.modalService.open(WarningModal, { width: '60vh' }, {
      props: {
        title: 'Eliminar',
        message: `¿Está seguro de que quiere eliminar ${event.name}?`,
        type: 'delete'
      }
    }).then(() => {
      this.eventService.delete(event.id).subscribe(() =>  this.updateView());
    }).catch(() => this.modalService.close());
  }

  edit(event: any) {
    this.modalService.open(UpdateEventModal, { width: '90vh', height: '90vh' }, { event: event })
      .then((item: FormData) => {
        this.eventService.update(event.id, item).subscribe(async () => {


          this.updateView()



        });
      }).catch(() => this.modalService.close());
  }



  protected readonly formatDate = formatDate;
  protected readonly transformDate = transformDate;
}
