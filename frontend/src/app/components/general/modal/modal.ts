import {ChangeDetectorRef, Component, ComponentRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [
    NgStyle,
    NgIf
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  standalone: true
})
export class Modal {
  @ViewChild('modalContent', { read: ViewContainerRef, static: false })
  modalContent!: ViewContainerRef;

  show = false;
  styles: { [key: string]: string } = {};
  private componentRef?: ComponentRef<any>;

  constructor(private cd: ChangeDetectorRef) {}

  open<T>(
    component: Type<T>,
    styles: { [key: string]: string } = {},
    data: Partial<T> = {}
  ): Promise<any> {
    this.styles = styles;
    this.show = true;
    this.cd.detectChanges(); // 🔄 Asegura renderizado del modal antes de insertar el contenido

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!this.modalContent) return;

        // Limpia el contenido anterior
        this.modalContent.clear();

        // Crea el nuevo componente dinámicamente
        this.componentRef = this.modalContent.createComponent(component);

        // Inyecta las props iniciales (por ejemplo, datos del padre)
        Object.assign(this.componentRef.instance, data);

        // Inyecta las funciones de control del modal
        (this.componentRef.instance as any).close = () => {
          this.close();
          reject(); // o resolve(false) si prefieres
        };

        (this.componentRef.instance as any).confirm = (result?: any) => {
          this.close();
          resolve(result);
        };

        this.cd.detectChanges(); // 🔄 Re-render final después de crear el contenido
      });
    });
  }

  close() {
    if (this.modalContent) {
      this.modalContent.clear();
    } else {
      console.warn('⚠️ ModalComponent: modalContent no está disponible al cerrar el modal.');
    }

    this.show = false;
    this.cd.detectChanges(); // 🔄 Actualiza el estado de visibilidad del modal
  }
}
