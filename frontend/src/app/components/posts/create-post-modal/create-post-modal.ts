import {Component, Input, OnInit} from '@angular/core';
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
import {combineDateAndTime, formatToSqlTimestamp, getThemes, getThemesIcon} from '../../../services/utilities-service';
import {map, Observable, startWith} from 'rxjs';
import {MatChipRow} from '@angular/material/chips';


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
  @Input() events: any[] = []
  form!: FormGroup;
  previewCoverImage!: string;
  selectedImagesCover: any[] = []
  eventsControl = new FormControl('');
  filteredEvents!: Observable<{id: number, name: string}[]>;
  confirm!: (result?: any) => void;
  close!: () => void;


  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      description: ['', Validators.required],
      hashtags: this.formBuilder.array([], Validators.required),
      url: ['', Validators.required],
      events: this.formBuilder.array([], Validators.required),
    })
  }

  ngOnInit() {
    this.filteredEvents = this.eventsControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.events))
    );
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

  private _filter(value: string, array: any[]): any[] {
    const filterValue = value.toLowerCase();
    return array.filter(option => option.name.toLowerCase().includes(filterValue));
  }


  createPost(){
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




  protected readonly getThemesIcon = getThemesIcon;
}
