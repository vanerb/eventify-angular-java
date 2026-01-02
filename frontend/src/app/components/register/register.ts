import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth-service';
import {Router, RouterLink} from '@angular/router';
import {Container} from '../general/container/container';
import {NgIf} from '@angular/common';
import {getImage} from "../../services/utilities-service";
import {MatFormField, MatInput, MatInputModule} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {ModalService} from '../../services/modal-service';
import {WarningModal} from '../general/warning-modal/warning-modal';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Container,
    NgIf,
    MatFormField,
    MatInput,
    MatInputModule,
    MatButton
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: true
})
export class Register implements OnInit{

  form!: FormGroup

  selectedImagesCover: File[] = [];
  previewCoverImage!: string;

  constructor(private readonly authService: AuthService, private router: Router, private fb: FormBuilder, private cd: ChangeDetectorRef, private readonly modalService: ModalService) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      repeatPassword: ['', [Validators.required]],
      profile_photo: [null],
    });
  }

  ngOnInit() {
    this.previewCoverImage = getImage(null)
  }

  async onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImagesCover = [input.files[0]]; // reemplaza la anterior
    }

    // Generar vista previa
    const reader = new FileReader();
    reader.onload = () => {
      this.previewCoverImage = reader.result as string; // base64
    };
    reader.readAsDataURL(this.selectedImagesCover[0]);
    this.cd.detectChanges()
  }


  register() {
    if (this.form.valid) {
      if (this.form.get('password')?.value !== '' && this.form.get('repeatPassword')?.value !== '') {
        if (this.form.get('password')?.value === this.form.get('repeatPassword')?.value) {

          const formData = new FormData();

          if (this.selectedImagesCover.length > 0) {
            formData.append('file', this.selectedImagesCover[0]);
          }

          formData.append('email', this.form.get('email')?.value);
          formData.append('username', this.form.get('username')?.value);
          formData.append('name', this.form.get('name')?.value);
          formData.append('password', this.form.get('password')?.value);


          this.authService.register(formData).subscribe({
            next: async () => {
              await this.authService.logout();
            },
            error: (err) => {
              this.modalService.open(WarningModal, {
                  width: '60vh',
                },
                {
                  props: {
                    title: 'Error',
                    message: 'An unexpected error occurred while creating the account. The error is ' + err.error.error,
                    type: 'info'
                  }
                }).then(async (item: FormData) => {
              })
                .catch(() => {
                  this.modalService.close()
                });
            }
          });


        } else {
          this.modalService.open(WarningModal, {
              width: '60vh',
            },
            {
              props: {
                title: 'Error',
                message: 'The passwords do not match, please check.',
                type: 'info'
              }
            }).then(async (item: FormData) => {
          })
            .catch(() => {
              this.modalService.close()
            });
        }
      } else {
        this.modalService.open(WarningModal, {
            width: '60vh',
          },
          {
            props: {
              title: 'Error',
              message: 'Password fields cannot be left empty.',
              type: 'info'
            }
          }).then(async (item: FormData) => {
        })
          .catch(() => {
            this.modalService.close()
          });
      }
    } else {
      this.modalService.open(WarningModal, {
          width: '60vh',
        },
        {
          props: {
            title: 'Error',
            message: 'You need to complete all the fields.',
            type: 'info'
          }
        }).then(async (item: FormData) => {
      })
        .catch(() => {
          this.modalService.close()
        });
    }

  }

}
