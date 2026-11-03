import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemoApi } from './demo-api';
import { ApiFail, DemoStore, Row, STATUS_TEXT } from './demo-store';

let api: DemoApi | null = null;

/** API simulada compartida por el interceptor y el chat de la demo. */
export const demoApi = () => (api ??= new DemoApi(new DemoStore()));

/** Vuelve a los datos de muestra originales (borra lo guardado en este navegador). */
export function resetDemoData(): void {
  demoApi().reset();
}

/** Lee el FormData como Spring: texto en @RequestParam, blobs JSON en @RequestPart y el resto como archivos. */
async function readFormData(form: FormData, body: Row, files: Record<string, File>): Promise<void> {
  for (const [key, value] of Array.from(form.entries())) {
    if (typeof value === 'string') {
      body[key] = value;
    } else if (value.type === 'application/json') {
      body[key] = JSON.parse(await value.text());
    } else if (value.size > 0) {
      files[key] = value;
    }
  }
}

/**
 * Sustituye al servidor en la demo estática: las peticiones a http://localhost:8080/api se
 * resuelven en el navegador con DemoApi; cualquier otra URL sigue su camino normal.
 */
export const demoBackendInterceptor: HttpInterceptorFn = (request, next) => {
  const match = /^(?:https?:\/\/[^/]+)?\/api(\/[^?#]*)?(?:\?([^#]*))?/.exec(request.url);
  if (!match) return next(request);

  return new Observable(subscriber => {
    let cancelled = false;
    const path = (match[1] ?? '').replace(/\/+$/, '');
    const run = async () => {
      const body: Row = {};
      const files: Record<string, File> = {};
      const query: Record<string, string> = {};
      new URLSearchParams(match[2] ?? '').forEach((value, key) => (query[key] = value));
      for (const key of request.params.keys()) query[key] = request.params.get(key) ?? '';
      // Latencia breve para que la interfaz muestre sus estados de carga como con un servidor real.
      await new Promise(resolve => setTimeout(resolve, 150));
      try {
        if (request.body instanceof FormData) await readFormData(request.body, body, files);
        else if (request.body && typeof request.body === 'object') Object.assign(body, request.body);
        const result = await demoApi().handle({
          method: request.method, path, query, body, files, authorization: request.headers.get('Authorization')
        });
        if (!cancelled) {
          subscriber.next(new HttpResponse({ status: result.status, body: result.body, url: request.url }));
          subscriber.complete();
        }
      } catch (error) {
        if (cancelled) return;
        const status = error instanceof ApiFail ? error.status : 500;
        if (!(error instanceof ApiFail)) console.error('[demo]', error);
        subscriber.error(new HttpErrorResponse({
          status,
          statusText: STATUS_TEXT[status] ?? 'Error',
          url: request.url,
          error: { timestamp: new Date().toISOString(), status, error: STATUS_TEXT[status] ?? 'Error', path: '/api' + path }
        }));
      }
    };
    void run();
    return () => { cancelled = true; };
  });
};
