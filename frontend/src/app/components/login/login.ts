import {Component, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth-service';
import {Router, RouterLink} from '@angular/router';
import {ModalService} from '../../services/modal-service';
import {WarningModal} from '../general/warning-modal/warning-modal';
import {Container} from '../general/container/container';
import {MatFormField, MatInput, MatInputModule} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';

@Component({
  selector: 'app-login',
  imports: [
    Container,
    ReactiveFormsModule,
    RouterLink,
    MatFormField,
    MatInput,
    MatInputModule,
    MatButton,
    MatCard
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class Login {

  form: FormGroup;

  isError = signal<boolean>(false);

  constructor(
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly modalService: ModalService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  login(): void {

    const body = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value
    };

    this.authService.login(body).subscribe({

      next: async (token: any) => {

        console.log(token);

        this.authService.setToken(token.token);

        await this.router.navigate(['/']);

        this.isError.set(false);

        window.location.reload();
      },

      error: () => {

        this.isError.set(true);

        this.modalService.open(
          WarningModal,
          {
            width: '60vh',
          },
          {
            props: {
              title: 'Error',
              message: 'The username or password is incorrect',
              type: 'info'
            }
          }
        )
        .catch(() => {
          this.modalService.close();
        });

      }

    });
  }
}