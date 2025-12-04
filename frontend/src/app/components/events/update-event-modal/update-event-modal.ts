import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatFormField, MatInput, MatInputModule} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {map, Observable, startWith} from 'rxjs';
import {
  combineDateAndTime,
  formatToSqlTimestamp,
  getThemes,
  getThemesIcon, transformDate,
  transformDateHour
} from '../../../services/utilities-service';
import {MatChipRow} from '@angular/material/chips';
import {MatCheckboxModule} from '@angular/material/checkbox';

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
    MatChipRow,
    MatCheckboxModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './update-event-modal.html',
  styleUrl: './update-event-modal.css',
  standalone: true
})
export class UpdateEventModal implements OnInit{
  event!: any
  searchResults: any[] = [];
  searchTimeout: any;
  form!: FormGroup;
  themesControl = new FormControl('');
  filteredThemes!: Observable<{id: number, name: string, icon: string}[]>;
  previewCoverImage!: string;
  selectedImagesCover: File[] = [];
  isOnline: boolean = false;

  confirm!: (result?: any) => void;
  close!: () => void;

  constructor(private readonly http: HttpClient, private formBuilder: FormBuilder, private cd: ChangeDetectorRef) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: [false, Validators.required],
      themes: this.formBuilder.array([], Validators.required),
      initDate: ['', Validators.required],
      initHour: ['', Validators.required],
      endDate: ['', Validators.required],
      endHour: ['', Validators.required],
      placeId: [''],
      ubication: [''],
      latitude: [''],
      longitude: ['']
    })
  }

  ngOnInit() {
    this.filteredThemes = this.themesControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', getThemes()))
    );

    this.previewCoverImage = 'http://localhost:8080'+this.event?.image?.url

    this.form.get('name')?.setValue(this.event.name)
    this.form.get('description')?.setValue(this.event.description)
    this.form.get('type')?.setValue(this.event.type)
    this.isOnline = this.event.type === 'online' ? true : false

    this.event.themes.map((el: any)=>{
      this.addTheme({
        id: el.id,
        name: el.name
      })
    })
    //this.form.get('themes')?.setValue(this.event.themes)

    this.form.get('initDate')?.setValue(new Date(transformDate(this.event.initDate)))
    this.form.get('endDate')?.setValue(new Date(transformDate(this.event.endDate)))
    this.form.get('initHour')?.setValue(transformDateHour(this.event.initDate))
    this.form.get('endHour')?.setValue(transformDateHour(this.event.endDate))
    this.form.get('placeId')?.setValue(this.event.placeId)
    this.form.get('ubication')?.setValue(this.event.ubication)
    this.form.get('latitude')?.setValue(this.event.latitude)
    this.form.get('longitude')?.setValue(this.event.longitude)

  }


  async onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImagesCover = [input.files[0]];
    }


    const reader = new FileReader();
    reader.onload = () => {
      this.previewCoverImage = reader.result as string;
    };
    reader.readAsDataURL(this.selectedImagesCover[0]);
    this.cd.detectChanges()
  }


  private _filter(value: string, array: any[]): any[] {
    const filterValue = value.toLowerCase();
    return array.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onSearch(event: any) {
    const query = event.target.value;

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {

      if (query.length < 3) {
        this.searchResults = [];
        return;
      }

      const url = `http://localhost:8080/api/location/search?query=${query}`;

      this.http.get<any[]>(url).subscribe(results => {
        this.searchResults = results;
      });

    }, 300);
  }

  onSelectPlace(place: any) {
    // Ocultar resultados
    this.searchResults = [];

    this.form.get('placeId')?.setValue(place.place_id);
    this.form.get('ubication')?.setValue(place.display_name);
    this.form.get('longitude')?.setValue(place.lon);
    this.form.get('latitude')?.setValue(place.lat);
  }


  createEvent(){


    const event = {
      name: this.form.get('name')?.value ?? '',
      description: this.form.get('description')?.value,
      type:  this.form.get('type')?.value ? 'online' : 'notOnline',
      themes: this.themesFormArray.value,
      initDate: formatToSqlTimestamp(combineDateAndTime(this.form.get('initDate')?.value,  this.form.get('initHour')?.value))  ,
      endDate: formatToSqlTimestamp(combineDateAndTime(this.form.get('endDate')?.value,  this.form.get('endHour')?.value)) ,
      placeId: this.form.get('placeId')?.value,
      ubication: this.form.get('ubication')?.value,
      latitude: this.form.get('latitude')?.value,
      longitude: this.form.get('longitude')?.value,
    };

    const formData = new FormData();
    formData.append('file', this.selectedImagesCover[0]); // archivo
    formData.append('event', new Blob([JSON.stringify(event)], { type: 'application/json' }));

    console.log(formData)

    this.confirm(formData);
  }

  addTheme(genre: { id: number; name: string }) {
    const exists = this.themesFormArray.controls.some(
      control => control.value.id === genre.id
    );

    if (!exists) {
      this.themesFormArray.push(this.formBuilder.control(genre));
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
