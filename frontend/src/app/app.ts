import {Component, signal, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Index} from './components/index';
import {Header} from './components/header/header';
import {Modal} from './components/general/modal/modal';
import {ModalService} from './services/modal-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Modal],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  @ViewChild('modal') modal!: Modal;

  constructor(private modalService: ModalService) { }

  ngAfterViewInit() {
    this.modalService.register(this.modal);
  }
}
