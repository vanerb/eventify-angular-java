import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Container} from '../general/container/container';
import {ModalService} from '../../services/modal-service';
import {CreateEventModal} from '../events/create-event-modal/create-event-modal';
import {EventSevice} from '../../services/event-sevice';
import {ShowEventModal} from '../events/show-event-modal/show-event-modal';
import {NgForOf, NgIf} from '@angular/common';
import {firstValueFrom} from 'rxjs';
import {AuthService} from '../../services/auth-service';
import {CardEvents} from './card-events/card-events';
import {User} from '../../models/users';
import {MapService} from '../../services/map-service';
import {UpdateEventModal} from './update-event-modal/update-event-modal';
import {WarningModal} from '../general/warning-modal/warning-modal';
import {Paginator} from '../general/paginator/paginator';
import {EventPage,Event} from '../../models/events';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {EventFilters} from '../../services/event-sevice';
import {getThemes} from '../../services/utilities-service';

@Component({
  selector: 'app-events',
  imports: [Container, NgIf, NgForOf, CardEvents, Paginator, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css',
  standalone: true
})
export class Events implements OnInit, AfterViewInit{
  map: any;
  events: Event[] = [];
  myEvents: Event[] = [];
  user!: User;
  selectedView: string = 'list';
  eventPagination!: EventPage
  category = '';
  categoryLabel = '';
  themeOptions = getThemes();
  filtersOpen = false;
  filters: EventFilters & {datePreset: string} = {category: '', search: '', type: '', location: '', datePreset: ''};
  private appliedFilters: EventFilters = {};

  @Input() view: 'general' | 'my' = 'general';

  page: number = 0;
  limit: number = 20;

  constructor(
    private readonly mapService: MapService,
    private readonly modalService: ModalService,
    private readonly eventService: EventSevice,
    private readonly authService: AuthService,
    private readonly cd: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  async ngAfterViewInit() {
    if(this.authService.getToken()){
      this.user = await firstValueFrom(this.authService.getUserByToken());
    }


    await this.mapService.initLeaflet();

  }

  setView(view: 'map' | 'list') {
    this.selectedView = view;
    if (view === 'map') {
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
        else this.initMap();
      }, 50);
    }
  }

  clearCategory() {
    this.filters.category = '';
    this.applyFilters();
  }

  get activeFilterCount(): number {
    const applied = this.appliedFilters;
    return [applied.category, applied.search, applied.type, applied.location, applied.fromDate]
      .filter(value => !!value).length;
  }

  applyFilters() {
    const dates = this.getDateRange(this.filters.datePreset);
    this.appliedFilters = {
      category: this.filters.category || '',
      search: this.filters.search?.trim() || '',
      type: this.filters.type || '',
      location: this.filters.location?.trim() || '',
      fromDate: dates.fromDate,
      toDate: dates.toDate,
    };
    this.category = this.appliedFilters.category || '';
    this.categoryLabel = this.getCategoryLabel(this.category);
    this.page = 0;
    this.filtersOpen = false;

    if ((this.route.snapshot.queryParamMap.get('category') || '') !== this.category) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {category: this.category || null},
        queryParamsHandling: 'merge',
      });
      return;
    }

    this.updateView();
    if (this.map) this.loadEventMarkers();
  }

  resetFilters() {
    this.filters = {category: '', search: '', type: '', location: '', datePreset: ''};
    this.appliedFilters = {};
    this.category = '';
    this.categoryLabel = '';
    this.page = 0;
    this.filtersOpen = false;
    if (this.route.snapshot.queryParamMap.has('category')) {
      this.router.navigate([], {relativeTo: this.route, queryParams: {category: null}, queryParamsHandling: 'merge'});
      return;
    }
    this.updateView();
    if (this.map) this.loadEventMarkers();
  }

  private getCategoryLabel(category: string): string {
    const theme = this.themeOptions.find(option => option.name.toLowerCase() === category.toLowerCase());
    return theme?.name || ({music: 'Music', food: 'Gastronomy', outdoor: 'Outdoor', creative: 'Creativity'} as Record<string, string>)[category] || '';
  }

  private getDateRange(preset: string): {fromDate?: string; toDate?: string} {
    if (!preset) return {};
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);

    if (preset === 'weekend') {
      const daysUntilSaturday = (6 - from.getDay() + 7) % 7;
      from.setDate(from.getDate() + daysUntilSaturday);
      to.setTime(from.getTime());
      to.setDate(to.getDate() + 1);
    } else if (preset === 'week') {
      to.setDate(to.getDate() + 6);
    }

    const format = (date: Date) => {
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    return {fromDate: format(from), toDate: preset === 'upcoming' ? undefined : format(to)};
  }

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
    this.route.queryParamMap.subscribe(params => {
      this.category = params.get('category') || '';
      this.categoryLabel = this.getCategoryLabel(this.category);
      this.filters.category = this.category;
      this.appliedFilters.category = this.category;
      this.page = 0;
      this.updateView();
      if (this.map) this.loadEventMarkers();
    });
  }

  updatePagination(page: number, limit: number){
    this.page = page
    this.limit = limit
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
    this.eventService.getAll(this.page, this.limit, this.view === 'general' ? this.appliedFilters : {}).subscribe((events: EventPage) => {
      this.events = events.content
      this.eventPagination = events
      this.cd.detectChanges()
    });
  }

  getAllMyEvents() {
    this.eventService.getMyEvents(this.page, this.limit).subscribe((events:EventPage) => {
      this.myEvents = events.content
      this.eventPagination = events
      this.cd.detectChanges()
    });
  }

  loadEventMarkers() {
    this.eventService.getAll(this.page, this.limit, this.appliedFilters).subscribe((events:EventPage) => {
      this.eventPagination = events

      this.mapService.addEventMarkers(events.content, (event) => {
        this.modalService.open(ShowEventModal, {
          width: 'min(760px, 92vw)',
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
    this.modalService.open(ShowEventModal, { width: 'min(760px, 92vw)' }, { ubication: event, user: this.user })
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

}
