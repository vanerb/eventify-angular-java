import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AfterViewInit, Component, OnInit} from '@angular/core';
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
import {WarningModal} from '../general/warning-modal/warning-modal';
import {UpdateEventModal} from '../events/update-event-modal/update-event-modal';
import {CardEvents} from './card-events/card-events';

@Component({
  selector: 'app-events',
  imports: [Container, MatButtonToggleModule, MatCardModule, NgIf, NgForOf, MatChipRow, MatButton, FormsModule, CardEvents],
  templateUrl: './events.html',
  styleUrl: './events.css',
  standalone: true
})
export class Events implements OnInit, AfterViewInit{
  private L: any;
  map: any;
  currentMarker: any;
  events: any[] = []
  bannerImage!: any[]
  user!: any
  selectedView: string = 'list'


  constructor(private http: HttpClient, private readonly modalService: ModalService, private readonly eventService: EventSevice, private readonly imageService: ImagesService, private readonly authService: AuthService) {
  }


  async ngAfterViewInit() {


    if (typeof window !== 'undefined') {
      this.user = await firstValueFrom(this.authService.getUserByToken())

      const leaflet = await import('leaflet');

      this.L = leaflet;


      const DefaultIcon = this.L.icon({
        iconUrl: 'assets/leaflet/marker-icon.png',
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      this.L.Marker.prototype.options.icon = DefaultIcon;

      this.initMap();
    }
  }


   ngOnInit() {
    this.getAllEvents()

    this.initMap();


    console.log("AAA",this.events)
  }

  getAllEvents(){
    this.eventService.getAll()
      .subscribe(async events => {
        this.events = events;
        console.log(events)
      });
  }

  eventActions(data: any){
    if(data){
      switch (data.action){
        case 'delete':
          this.delete(data.event)
          break

        case 'show':
          this.show(data.event)
          break

        case 'edit':
          this.edit(data.event)
          break
      }
    }
  }


  show(event: any) {
    this.modalService.open(ShowEventModal, {
        width: '90vh',
        height: '90vh',
      },
      {
        ubication: event
      }).then(async (item: FormData) => {


      this.eventService.joinEvent(event.id, this.user.id).subscribe(async result => {
        console.log(result)
      });


    })
      .catch(() => {
        this.modalService.close()
      });
  }

  delete(event: any) {
    this.modalService.open(WarningModal, {
        width: '60vh',
      },
      {
        props: {
          title: 'Eliminar',
          message: '¿Está seguro de que quiere eliminar ' + event.name + '?',
          type: 'delete'
        }

      }).then(async (item: FormData) => {


      this.eventService.delete(event.id).subscribe(async (result: any) => {
        console.log(result)
        this.getAllEvents()
      })


    })
      .catch(() => {
        this.modalService.close()
      });
  }

  edit(event: any) {
    this.modalService.open(UpdateEventModal, {
        width: '90vh',
        height: '90vh',
      },
      {
        event: event
      }).then(async (item: FormData) => {
      this.eventService.update(event.id, item).subscribe(async (result: any) => {
        this.getAllEvents()
      })
    })
      .catch(() => {
        this.modalService.close()
      });
  }




  updateMap() {
    this.initMap();
  }


  private initMap(): void {
    this.map = this.L.map('map').setView([40.4168, -3.7038], 6);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.getEventLocations();

    this.map.on('click', (e: any) => {
      const {lat, lng} = e.latlng;

      // Eliminar marcador anterior
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }

      // Crear marcador
      this.currentMarker = this.L.marker([lat, lng]).addTo(this.map);


      // Obtener info de la ubicación
      this.getLocationInfo(lat, lng);


    });
  }


  private getLocationInfo(lat: number, lng: number) {
    const url = `http://localhost:8080/api/location?lat=${lat}&lng=${lng}`;

    this.http.get(url).subscribe((data: any) => {
      const displayName = data.display_name || 'Sin información';
      console.log('Información de la ubicación:', data);
      // Mostrar en popup
      this.currentMarker.bindPopup(displayName).openPopup();
    });
  }

  private getEventLocations() {
    this.eventService.getAll()
      .subscribe(events => {
        events.forEach(event => {

          const marker = this.L.marker([event.latitude, event.longitude])
            .addTo(this.map)
            .bindPopup(`<b>${event.name}</b>`);

          marker.on('click', () => {
            this.modalService.open(ShowEventModal, {
                width: '90vh',
                height: '90vh',
              },
              {
                ubication: event
              }).then(async (item: FormData) => {


            })
              .catch(() => {
                this.modalService.close()
              });
          });
        });
      });
  }

  createEvent() {
    this.modalService.open(CreateEventModal, {
      width: '90vh',
      height: '90vh',
    }).then(async (item: FormData) => {
      this.eventService.create(item).subscribe({
        next: async () => {
          this.getAllEvents()
        },
        error: error => {
          console.log(error)
        }
      })

    })
      .catch(() => {
        this.modalService.close()
      });
  }

  protected readonly formatDate = formatDate;
  protected readonly transformDate = transformDate;
}
