import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth-service';
import {Router, RouterLink} from '@angular/router';
import {ModalService} from '../../services/modal-service';
import {WarningModal} from '../general/warning-modal/warning-modal';
import {Container} from '../general/container/container';
import {MatFormField, MatInput, MatInputModule} from '@angular/material/input';
import {MatButton} from '@angular/material/button';


@Component({
  selector: 'app-login',
  imports: [Container, ReactiveFormsModule, RouterLink, MatFormField, MatInput, MatInputModule, MatButton],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class Login {
  form: FormGroup
  isError: boolean = false;
  constructor(private readonly authService: AuthService, private fb: FormBuilder, private readonly router: Router, private readonly modalService: ModalService) {
    this.form = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }


  login() {
    const login = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
    }

    this.authService.login(login).subscribe({
      next: async (token: any) => {
        console.log(token)


        this.authService.setToken(token.token);
        //this.authService.setType(token.type)
        await this.router.navigate(['/']);
        window.location.reload()
        this.isError = false
      },
      error: (err) => {
        this.modalService.open(WarningModal, {
            width: '60vh',
          },
          {
            props: {
              title: 'Error',
              message: 'The username or password is incorrect',
              type: 'info'
            }
          }).then(async (item: FormData) => {
        })
          .catch(() => {
            this.modalService.close()
          });
      },
    });

  }
}
