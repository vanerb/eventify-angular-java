import {Injectable, Type} from '@angular/core';
import {Modal} from '../components/general/modal/modal';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private modalRef?: Modal;

  private onOpenCallback?: () => void;

  register(modal: Modal): void {
    this.modalRef = modal;
  }

  registerOnOpen(callback: () => void): void {
    this.onOpenCallback = callback;
  }

  open<T>(
    component: Type<T>,
    styles: { [key: string]: string } = {},
    data: Partial<T> = {}
  ): Promise<any> {

    this.onOpenCallback?.();

    return this.modalRef!.open(component, styles, data);
  }

  close(): void {
    this.modalRef?.close();
  }
}