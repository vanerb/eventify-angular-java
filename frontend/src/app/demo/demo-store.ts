import { buildSeed } from './demo-seed';

export type Row = Record<string, any>;

const STORAGE_KEY = 'eventify_demo_db_v1';

/**
 * Error HTTP con el mismo cuerpo que devuelve Spring Boot por defecto cuando un servicio
 * lanza una excepción: {timestamp, status, error, path}.
 */
export class ApiFail {
  constructor(readonly status: number) {}
}

export function fail(status = 500): never {
  throw new ApiFail(status);
}

export const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  500: 'Internal Server Error'
};

/**
 * Base de datos en memoria para la demo de GitHub Pages: parte de los datos de muestra y
 * guarda los cambios en localStorage del navegador (cada visitante tiene su propia copia).
 */
export class DemoStore {
  private tables: Record<string, Row[]>;

  constructor() {
    this.tables = this.read() ?? buildSeed();
  }

  private read(): Record<string, Row[]> | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tables));
    } catch {
      // Sin espacio o almacenamiento bloqueado: la demo sigue funcionando en memoria.
    }
  }

  reset(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* sin almacenamiento */ }
    this.tables = buildSeed();
  }

  t(name: string): Row[] {
    return (this.tables[name] ??= []);
  }

  find(name: string, id: number): Row | undefined {
    return this.t(name).find(row => row['id'] === id);
  }

  findOrFail(name: string, id: number): Row {
    return this.find(name, id) ?? fail();
  }

  insert(name: string, row: Row): Row {
    const table = this.t(name);
    const id = table.reduce((max, item) => Math.max(max, Number(item['id']) || 0), 0) + 1;
    const created = { id, ...row };
    table.push(created);
    return created;
  }

  remove(name: string, predicate: (row: Row) => boolean): number {
    const table = this.t(name);
    const before = table.length;
    this.tables[name] = table.filter(row => !predicate(row));
    return before - this.tables[name].length;
  }
}

/** Página con el mismo formato JSON que Page<T> de Spring Data. */
export function page<T>(rows: T[], query: Record<string, string>): Row {
  const number = Math.max(0, parseInt(query['page'] ?? '0', 10) || 0);
  const size = Math.max(1, parseInt(query['size'] ?? '10', 10) || 10);
  const content = rows.slice(number * size, number * size + size);
  const totalPages = Math.ceil(rows.length / size);
  const sort = { empty: true, sorted: false, unsorted: true };
  return {
    content,
    pageable: { pageNumber: number, pageSize: size, sort, offset: number * size, paged: true, unpaged: false },
    last: number >= totalPages - 1,
    totalElements: rows.length,
    totalPages,
    size,
    number,
    sort,
    first: number === 0,
    numberOfElements: content.length,
    empty: content.length === 0
  };
}
