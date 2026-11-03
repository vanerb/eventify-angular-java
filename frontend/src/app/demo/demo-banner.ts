import { Component, signal } from '@angular/core';
import { resetDemoData } from './demo-backend.interceptor';
import { DEMO_PASSWORD } from './demo-seed';

/** Aviso fijo de la demo estática con las cuentas de prueba y un botón para restablecer los datos. */
@Component({
  selector: 'app-demo-banner',
  standalone: true,
  template: `
    <aside class="demo-banner" [class.closed]="closed()">
      @if (closed()) {
        <button type="button" class="pill" (click)="closed.set(false)">Demo · cuentas de prueba</button>
      } @else {
        <strong>Demo sin servidor</strong>
        <span>Los datos viven en tu navegador. Entra con <code>lucia&#64;eventify.demo</code>, <code>marc&#64;eventify.demo</code>,
          <code>sara&#64;eventify.demo</code> o <code>diego&#64;eventify.demo</code> y la contraseña <code>{{ password }}</code>.</span>
        <button type="button" (click)="reset()">Restablecer datos</button>
        <button type="button" class="close" aria-label="Ocultar aviso de demo" (click)="closed.set(true)">×</button>
      }
    </aside>
  `,
  styles: `
    .demo-banner{position:fixed;left:16px;bottom:16px;z-index:2000;display:flex;align-items:center;gap:12px;width:min(880px,calc(100% - 240px));padding:10px 12px 10px 16px;border:1px solid #3b2a7a;border-radius:16px;background:#f1eaff;color:#2a1f55;font:12px/1.45 Roboto,sans-serif;box-shadow:0 12px 32px #2a1f5533}
    .demo-banner.closed{width:auto;padding:0;border:0;background:none;box-shadow:none}
    strong{white-space:nowrap;font-weight:800}
    span{flex:1}
    code{padding:1px 5px;border-radius:6px;background:#ffffffcc;font-size:11px}
    button{border:1px solid #3b2a7a;border-radius:99px;background:#7454d8;color:#fff;padding:6px 11px;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer}
    .close{border:0;background:none;color:#2a1f55;font-size:18px;line-height:1;padding:2px 6px}
    .pill{box-shadow:0 8px 20px #2a1f5533}
    @media(max-width:900px){.demo-banner{width:calc(100% - 32px);bottom:88px}}
    @media(max-width:640px){.demo-banner:not(.closed){flex-wrap:wrap;gap:8px}span{flex-basis:100%;order:2}.close{margin-left:auto}}
  `
})
export class DemoBanner {
  readonly closed = signal(false);
  readonly password = DEMO_PASSWORD;

  reset(): void {
    resetDemoData();
    try { localStorage.removeItem('token'); } catch { /* sin almacenamiento */ }
    location.reload();
  }
}
