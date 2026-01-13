import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {
  combineDateAndTime,
  formatToSqlTimestamp,
  getImage,
  getThemes,
  getThemesIcon, sleep
} from '../../../services/utilities-service';
import {debounceTime, distinctUntilChanged, map, Observable, of, startWith} from 'rxjs';
import {MatChipRow} from '@angular/material/chips';
import {WarningModal} from '../../general/warning-modal/warning-modal';
import {ModalService} from '../../../services/modal-service';
import {EventSevice} from '../../../services/event-sevice';
import {EventPage} from '../../../models/events';


@Component({
  selector: 'app-create-post-modal',
  imports: [
    MatButton,
    NgIf,
    FormsModule,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    NgForOf,
    NgClass,
    MatChipRow
  ],
  templateUrl: './create-post-modal.html',
  styleUrl: './create-post-modal.css',
  standalone: true
})
export class CreatePostModal implements OnInit{
  events!: EventPage
  form!: FormGroup;
  previewCoverImage!: string;
  selectedImagesCover: any[] = []
  eventsControl = new FormControl('');
  filteredEvents!: Observable<{id: number, name: string}[]>;

  page = 0;
  limit = 10;


  confirm!: (result?: any) => void;
  close!: () => void;


  constructor(private formBuilder: FormBuilder, private readonly modalService: ModalService, private readonly eventService: EventSevice, private readonly cd: ChangeDetectorRef) {
    this.form = this.formBuilder.group({
      description: ['', Validators.required],
      hashtags: this.formBuilder.array([], Validators.required),
      url: [''],
      events: this.formBuilder.array([], Validators.required),
    })
  }

  ngOnInit() {
    this.eventsControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.page = 0;
        this.getMyEvents(value || '');
      });

    this.getMyEvents()

    this.previewCoverImage = getImage(null)
  }

  getMyEvents(search: string = '') {
    this.eventService
      .getMyEventParticipations(this.page, this.limit, search)
      .subscribe((events: EventPage) => {
        this.events = events;

        // 👇 sin filtrar nada
        this.filteredEvents = of(this.events.content);

        this.cd.detectChanges();
      });
  }


  prevPage() {
    if (this.page === 0) return;
    this.page--;
    this.getMyEvents(this.eventsControl.value || '');
  }

  nextPage() {
    if (this.page + 1 >= this.events.totalPages) return;
    this.page++;
    this.getMyEvents(this.eventsControl.value || '');
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

  }

  addEvent(event: { id: number; name: string }) {
    this.eventFormArray.clear();

    this.eventFormArray.push(this.formBuilder.control(event));

    this.eventsControl.setValue('');
  }

  addHashtagEnter(event: any) {
    event.preventDefault(); // Evita el submit del formulario
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    if (value && !this.hashtagExists(value)) {
      this.hashtagsFormArray.push(this.formBuilder.control({ name: value }));
    }

    input.value = '';
  }

  private hashtagExists(name: string): boolean {
    return this.hashtagsFormArray.controls.some(
      control => control.value.name.toLowerCase() === name.toLowerCase()
    );
  }

  removeEvent(index: number) {
    this.eventFormArray.removeAt(index);
  }

  get eventFormArray(): FormArray {
    return this.form.get('events') as FormArray;
  }

  get hashtagsFormArray(): FormArray {
    return this.form.get('hashtags') as FormArray;
  }

  removeHashtag(index: number) {
    this.hashtagsFormArray.removeAt(index);
  }




  createPost(){
    if(this.form.valid){
      const post = {
        description: this.form.get('description')?.value,
        event: this.eventFormArray.value[0],
        hashtags: this.hashtagsFormArray.value,
        url: this.form.get('url')?.value,
      };

      const formData = new FormData();
      formData.append('file', this.selectedImagesCover[0]); // archivo
      formData.append('post', new Blob([JSON.stringify(post)], { type: 'application/json' }));

      console.log(formData)

      this.confirm(formData);
    }
    else{
      this.modalService.open(WarningModal, {
          width: '60vh',
        },
        {
          props: {
            title: 'Aviso',
            message: 'El formulario no es correcto. ',
            type: 'info'
          }

        }).then(async (item: FormData) => {

      })
        .catch(() => {
          this.modalService.close()
        });
    }


  }




  protected readonly getThemesIcon = getThemesIcon;
}
