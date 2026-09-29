import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgForOf, NgIf, AsyncPipe } from '@angular/common';
import { MatFormField, MatInput, MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import {
  getImage,
  getThemes,
  getThemesIcon,
  transformDateHour,
} from '../../../services/utilities-service';
import { Event } from '../../../models/events';
import { WarningModal } from '../../general/warning-modal/warning-modal';
import { ModalService } from '../../../services/modal-service';

@Component({
  selector: 'app-update-event-modal',
  imports: [
    NgForOf,
    NgIf,
    MatFormField,
    MatInput,
    MatInputModule,
    MatButton,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    NgClass,
    AsyncPipe,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './update-event-modal.html',
  styleUrl: './update-event-modal.css',
  standalone: true,
})
export class UpdateEventModal implements OnInit {

  event!: Event;

  searchResults = signal<any[]>([]);

  searchTimeout: any;

  form!: FormGroup;

  themesControl = new FormControl('');

  filteredThemes!: Observable<
    {
      id: number;
      name: string;
      icon: string;
    }[]
  >;

  previewCoverImage = signal<string>('');

  selectedImagesCover: File[] = [];

  isOnline = signal<boolean>(false);

  confirm!: (result?: any) => void;

  close!: () => void;

  constructor(
    private readonly http: HttpClient,
    private readonly formBuilder: FormBuilder,
    private readonly modalService: ModalService,
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: [false],
      themes: this.formBuilder.array([], Validators.required),
      initDate: ['', Validators.required],
      initHour: ['', Validators.required],
      endDate: ['', Validators.required],
      endHour: ['', Validators.required],
      placeId: [''],
      ubication: [''],
      latitude: [''],
      longitude: [''],
    });
  }

  ngOnInit() {
    this.filteredThemes = this.themesControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '', getThemes())),
    );

    this.previewCoverImage.set(
      getImage(this.event?.image?.url)
    );

    this.form.get('name')?.setValue(this.event.name);

    this.form.get('description')?.setValue(
      this.event.description
    );

    this.form.get('type')?.setValue(
      this.event.type === 'online'
    );

    this.isOnline.set(
      this.event.type === 'online'
    );

    this.event.themes.map((el: any) => {
      this.addTheme({
        id: el.id,
        name: el.name,
      });
    });

    this.form.get('initDate')?.setValue(
      new Date(this.event.initDate)
    );

    this.form.get('endDate')?.setValue(
      new Date(this.event.endDate)
    );

    this.form.get('initHour')?.setValue(
      transformDateHour(this.event.initDate)
    );

    this.form.get('endHour')?.setValue(
      transformDateHour(this.event.endDate)
    );

    this.form.get('placeId')?.setValue(
      this.event.placeId
    );

    this.form.get('ubication')?.setValue(
      this.event.ubication
    );

    this.form.get('latitude')?.setValue(
      this.event.latitude
    );

    this.form.get('longitude')?.setValue(
      this.event.longitude
    );
  }

  toggleOnline(event: globalThis.Event) {
    const checked = (
      event.target as HTMLInputElement
    ).checked;

    this.isOnline.set(checked);

    this.form.get('type')?.setValue(checked);
  }

  async onImageChange(event: any) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedImagesCover = [input.files[0]];

    const reader = new FileReader();

    reader.onload = () => {
      this.previewCoverImage.set(
        reader.result as string
      );
    };

    reader.readAsDataURL(
      this.selectedImagesCover[0]
    );
  }

  private _filter(
    value: string,
    array: any[]
  ): any[] {
    const filterValue = value.toLowerCase();

    return array.filter(
      (option) =>
        option.name
          .toLowerCase()
          .includes(filterValue)
    );
  }

  onSearch(event: any) {
    const query = event.target.value;

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {

      if (query.length < 3) {
        this.searchResults.set([]);

        return;
      }

      const url =
        `http://localhost:8080/api/location/search?query=${query}`;

      this.http
        .get<any[]>(url)
        .subscribe((results) => {
          this.searchResults.set(results);
        });

    }, 300);
  }

  onSelectPlace(place: any) {
    this.searchResults.set([]);

    this.form.get('placeId')?.setValue(
      place.place_id
    );

    this.form.get('ubication')?.setValue(
      place.display_name
    );

    this.form.get('longitude')?.setValue(
      place.lon
    );

    this.form.get('latitude')?.setValue(
      place.lat
    );
  }

  updateEvent() {
    if (!this.form.valid) {
      this.modalService
        .open(
          WarningModal,
          {
            width: '60vh',
          },
          {
            props: {
              title: 'Aviso',
              message: 'El formulario no es correcto.',
              type: 'info',
            },
          },
        )
        .then(async (item: FormData) => {})
        .catch(() => {
          this.modalService.close();
        });

      return;
    }

    const initDate = this.formatLocalSqlTimestamp(
      this.form.get('initDate')?.value,
      this.form.get('initHour')?.value
    );

    const endDate = this.formatLocalSqlTimestamp(
      this.form.get('endDate')?.value,
      this.form.get('endHour')?.value
    );

    const event = {
      name: this.form.get('name')?.value ?? '',

      description:
        this.form.get('description')?.value,

      type: this.form.get('type')?.value
        ? 'online'
        : 'notOnline',

      themes: this.themesFormArray.value,

      initDate,

      endDate,

      placeId:
        this.form.get('placeId')?.value,

      ubication:
        this.form.get('ubication')?.value,

      latitude:
        this.form.get('latitude')?.value,

      longitude:
        this.form.get('longitude')?.value,
    };

    const formData = new FormData();

    if (this.selectedImagesCover.length > 0) {
      formData.append(
        'file',
        this.selectedImagesCover[0]
      );
    }

    formData.append(
      'event',
      new Blob(
        [JSON.stringify(event)],
        {
          type: 'application/json',
        }
      )
    );

    console.log('Fecha inicio:', initDate);
    console.log('Fecha fin:', endDate);
    console.log(formData);

    this.confirm(formData);
  }

  private formatLocalSqlTimestamp(
    dateValue: Date | string,
    timeValue: string
  ): string {

    const date = new Date(dateValue);

    const [hours, minutes] = timeValue
      .split(':')
      .map(Number);

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    const hoursFormatted = String(
      date.getHours()
    ).padStart(2, '0');

    const minutesFormatted = String(
      date.getMinutes()
    ).padStart(2, '0');

    const secondsFormatted = String(
      date.getSeconds()
    ).padStart(2, '0');

    return `${year}-${month}-${day} ${hoursFormatted}:${minutesFormatted}:${secondsFormatted}`;
  }

  addTheme(
    genre: {
      id: number;
      name: string;
    }
  ) {

    const exists =
      this.themesFormArray.controls.some(
        (control) =>
          control.value.id === genre.id
      );

    if (!exists) {
      this.themesFormArray.push(
        this.formBuilder.control(genre)
      );
    }

    this.themesControl.setValue('');
  }

  removeTheme(index: number) {
    this.themesFormArray.removeAt(index);
  }

  get themesFormArray(): FormArray {
    return this.form.get('themes') as FormArray;
  }

  protected readonly getThemesIcon = getThemesIcon;
}