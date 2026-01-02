import {Component, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {MatFormField} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDivider} from '@angular/material/divider';
import {MatButton} from '@angular/material/button';
import {getImage} from '../../../services/utilities-service';

@Component({
  selector: 'app-update-user-modal',
  imports: [
    NgIf,
    MatFormField,
    MatInput,
    MatLabel,
    FormsModule,
    ReactiveFormsModule,
    MatDivider,
    MatButton
  ],
  templateUrl: './update-user-modal.html',
  styleUrl: './update-user-modal.css',
  standalone: true
})
export class UpdateUserModal implements OnInit{
  user!: any
  selectedImageProfileCover: File[] = [];
  previewProfileCoverImage!: string;

  selectedImageBannerCover: File[] = [];
  previewBannerCoverImage!: string;

  form!: FormGroup

  confirm!: (result?: any) => void;
  close!: () => void;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      bio: ['', Validators.required],
      profileImage: [null],
      bannerImage: [null],
      password: ['', [Validators.required]],
      repeatPassword: ['', [Validators.required]],
    })
  }

  ngOnInit() {
    this.previewProfileCoverImage = getImage(this.user.image.url)

    this.previewBannerCoverImage = getImage(this.user?.banner?.url)

    this.form.get('name')?.setValue(this.user.name)
    this.form.get('bio')?.setValue(this.user.bio)
    this.form.get('username')?.setValue(this.user.username)

  }

  update(){
    let user = null;

    if (this.form.get('password')?.value !== '' && this.form.get('repeatPassword')?.value !== '') {
      if (this.form.get('password')?.value === this.form.get('repeatPassword')?.value) {
        user = {
          name: this.form.get('name')?.value,
          bio: this.form.get('bio')?.value,
          username: this.form.get('username')?.value,
          password: this.form.get('password')?.value,
        };
      }
    }
    else{
      user = {
        name: this.form.get('name')?.value,
        bio: this.form.get('bio')?.value,
        username: this.form.get('username')?.value,
      };
    }


    const formData = new FormData();
    formData.append('profilePic', this.selectedImageProfileCover[0]);
    formData.append('banner', this.selectedImageBannerCover[0]);
    formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));

    console.log(formData)

    this.confirm(formData);


  }

  async onImageProfileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImageProfileCover = [input.files[0]];

    }


    const reader = new FileReader();
    reader.onload = () => {
      this.previewProfileCoverImage = reader.result as string;
    };
    reader.readAsDataURL(this.selectedImageProfileCover[0]);
  }

  async onImageBannerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImageBannerCover = [input.files[0]];
    }


    const reader = new FileReader();
    reader.onload = () => {
      this.previewBannerCoverImage = reader.result as string;
    };
    reader.readAsDataURL(this.selectedImageBannerCover[0]);
  }
}
