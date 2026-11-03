import themesJson from '../json/themes.json';
import { localDateTime } from './demo-seed';
import { imageDataUrl } from './demo-files';
import { DemoStore, fail, page, Row } from './demo-store';

export interface DemoRequest {
  method: string;
  /** Ruta tras /api, sin barra final (p. ej. /events/getAll). */
  path: string;
  query: Record<string, string>;
  /** Cuerpo JSON o campos de texto del formulario; las partes JSON (@RequestPart) ya vienen parseadas. */
  body: Row;
  files: Record<string, File>;
  /** Cabecera Authorization tal cual (null si no se envió). */
  authorization: string | null;
}

type Handler = (req: DemoRequest, params: string[]) => unknown | Promise<unknown>;

/** Lugares de reserva para el buscador de ubicaciones si OpenStreetMap no responde. */
const OFFLINE_PLACES: [string, number, number][] = [
  ['Madrid, Comunidad de Madrid, España', 40.4168, -3.7038],
  ['Barcelona, Cataluña, España', 41.3874, 2.1686],
  ['Valencia, Comunidad Valenciana, España', 39.4699, -0.3763],
  ['Sevilla, Andalucía, España', 37.3891, -5.9845],
  ['Zaragoza, Aragón, España', 41.6488, -0.8891],
  ['Málaga, Andalucía, España', 36.7213, -4.4214],
  ['Bilbao, País Vasco, España', 43.2630, -2.9350],
  ['San Sebastián, País Vasco, España', 43.3183, -1.9812],
  ['Granada, Andalucía, España', 37.1773, -3.5986],
  ['Salamanca, Castilla y León, España', 40.9701, -5.6635],
  ['Logroño, La Rioja, España', 42.4627, -2.4450],
  ['Palma, Islas Baleares, España', 39.5696, 2.6502]
];

/**
 * Réplica en el navegador de la API Spring Boot de Eventify (controladores de /api):
 * mismas rutas, mismos DTO en JSON y mismos errores.
 */
export class DemoApi {
  private readonly routes: [string, RegExp, Handler][] = [];

  constructor(private readonly db: DemoStore) {
    const r = (method: string, pattern: string, handler: Handler) =>
      this.routes.push([method, new RegExp('^' + pattern.replace(/\{\w+\}/g, '([^/]+)') + '$'), handler]);

    // AuthController
    r('POST', '/auth/register', req => this.register(req));
    r('POST', '/auth/login', req => this.login(req));
    r('POST', '/auth/update', req => this.updateUser(req));
    r('GET', '/auth/user', req => this.userDto(this.authUser(req, true)));

    // ChatRestController
    r('GET', '/chat/{eventId}', (_, [eventId]) =>
      this.db.t('chat').filter(m => m['eventId'] === Number(eventId)).sort((a, b) => a['timestamp'].localeCompare(b['timestamp'])));

    // CommentaryController
    r('POST', '/comments/create', req => this.createComment(req));
    r('DELETE', '/comments/delete/{id}', (_, [id]) => {
      this.db.findOrFail('comments', Number(id));
      this.db.remove('comments', c => c['id'] === Number(id));
      return null;
    });

    // EventController
    r('POST', '/events/create', req => this.saveEvent(req, null));
    r('POST', '/events/update/{id}', (req, [id]) => this.saveEvent(req, Number(id)));
    r('DELETE', '/events/delete/{id}', (_, [id]) => this.deleteEvent(Number(id)));
    r('POST', '/events/{eventId}/join/{userId}', (_, [eventId, userId]) => this.joinEvent(Number(eventId), Number(userId)));
    r('GET', '/events/findByUserId', req => {
      const user = this.authUser(req, false);
      return page(this.db.t('events').filter(e => e['creatorId'] === user['id']).sort((a, b) => b['id'] - a['id']).map(e => this.eventDto(e)), req.query);
    });
    r('GET', '/events/findMyEventParticipations', req => {
      const user = this.authUser(req, true);
      const search = (req.query['search'] ?? '').trim().toLowerCase();
      return page(this.db.t('events')
        .filter(e => e['participantIds'].includes(user['id']) && (!search || e['name'].toLowerCase().includes(search)))
        .map(e => this.eventDto(e)), req.query);
    });
    r('GET', '/events/getAll', req => page(this.findAllEvents(req.query).map(e => this.eventDto(e)), req.query));
    r('GET', '/events/{eventId}/users', (req, [eventId]) =>
      page(this.db.findOrFail('events', Number(eventId))['participantIds'].map((id: number) => this.userDto(this.db.findOrFail('users', id))), req.query));

    // ImageController
    r('POST', '/images/upload', async req => {
      const file = req.files['file'] ?? fail();
      const fromId = Number(req.query['fromId'] ?? req.body['fromId']);
      const fromType = String(req.query['fromType'] ?? req.body['fromType'] ?? fail(400));
      const isCover = String(req.query['isCover'] ?? req.body['isCover'] ?? 'false') === 'true';
      return this.db.insert('images', { url: await imageDataUrl(file), fromType, fromId, isCover });
    });
    r('GET', '/images/{fromType}/{fromId}', (_, [fromType, fromId]) =>
      this.db.t('images').filter(i => i['fromType'] === fromType && i['fromId'] === Number(fromId)));

    // LocationController (la API hace de proxy de OpenStreetMap Nominatim)
    r('GET', '/location', req => this.reverseGeocode(Number(req.query['lat']), Number(req.query['lng'])));
    r('GET', '/location/search', req => {
      if (!req.query['query']) fail(400);
      return this.searchPlaces(req.query['query']);
    });

    // PostController
    r('POST', '/posts/create', req => this.createPost(req));
    r('GET', '/posts/findByUserId', req => {
      const user = this.authUser(req, true);
      return page(this.db.t('posts').filter(p => p['creatorId'] === user['id']).sort((a, b) => b['id'] - a['id']).map(p => this.postDto(p)), req.query);
    });
    r('GET', '/posts/findById/{id}', (_, [id]) => this.postDto(this.db.findOrFail('posts', Number(id))));
    r('GET', '/posts/getAll', req => page([...this.db.t('posts')].sort((a, b) => b['id'] - a['id']).map(p => this.postDto(p)), req.query));
    r('DELETE', '/posts/delete/{id}', (_, [id]) => {
      this.db.findOrFail('posts', Number(id));
      this.deletePosts(p => p['id'] === Number(id));
      return null;
    });
  }

  reset(): void {
    this.db.reset();
  }

  async handle(req: DemoRequest): Promise<{ status: number; body: unknown }> {
    for (const [method, pattern, handler] of this.routes) {
      const match = pattern.exec(req.path);
      if (method !== req.method || !match) continue;
      const body = await handler(req, match.slice(1).map(decodeURIComponent));
      this.db.save();
      return { status: 200, body: body ?? null };
    }
    return fail(404);
  }

  // ---------- Autenticación (JWT simulado: lleva el email codificado, como el subject del JWT real) ----------

  private makeToken(email: string): string {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ sub: email, iat: Date.now() })))).replace(/=+$/, '');
    return `demo.${payload}.${Math.random().toString(36).slice(2)}`;
  }

  private authUser(req: DemoRequest, checkStoredToken: boolean): Row {
    if (req.authorization == null) fail(400); // @RequestHeader("Authorization") obligatorio
    const token = req.authorization.replace('Bearer ', '');
    let email: string;
    try {
      email = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))))['sub'];
    } catch {
      return fail(); // JwtUtil no puede leer el token
    }
    const user = this.db.t('users').find(u => u['email'] === email) ?? fail();
    if (checkStoredToken && user['token'] !== token) fail(); // "Invalid token"
    return user;
  }

  private login(req: DemoRequest): Row {
    const user = this.db.t('users').find(u => u['email'] === req.body['email']) ?? fail();
    if (user['password'] !== req.body['password']) fail();
    user['token'] = this.makeToken(user['email']);
    return { token: user['token'] };
  }

  private async register(req: DemoRequest): Promise<Row> {
    const { email, password, name, username } = req.body;
    if (email == null || password == null || name == null || username == null) fail(400);
    if (this.db.t('users').some(u => u['email'] === email)) fail(); // email único en la tabla
    const user = this.db.insert('users', { email, password, name, username, bio: null, token: null });
    if (req.files['file']) await this.replaceImage('USER', user['id'], req.files['file']);
    return this.userDto(user);
  }

  private async updateUser(req: DemoRequest): Promise<Row> {
    const user = this.authUser(req, false);
    const dto = req.body['user'] ?? fail(400);
    user['name'] = dto['name'] ?? null;
    user['bio'] = dto['bio'] ?? null;
    user['username'] = dto['username'] ?? null;
    if (dto['password'] && String(dto['password']).trim()) user['password'] = dto['password'];
    if (req.files['profilePic']) await this.replaceImage('USER', user['id'], req.files['profilePic']);
    if (req.files['banner']) await this.replaceImage('USER_BANNER', user['id'], req.files['banner']);
    return this.userDto(user);
  }

  // ---------- Eventos ----------

  /** El formulario de creación envía la fecha en UTC con "Z"; la guardamos en hora local. */
  private toLocalDateTime(value: unknown): string | null {
    if (value == null || value === '') return null;
    const text = String(value);
    if (/[zZ]$|[+-]\d\d:\d\d$/.test(text)) {
      const date = new Date(text);
      if (isNaN(date.getTime())) fail(400);
      return localDateTime(date);
    }
    return text.replace(/\.\d+$/, '').slice(0, 19);
  }

  private async saveEvent(req: DemoRequest, eventId: number | null): Promise<Row> {
    const user = this.authUser(req, false);
    const dto = req.body['event'] ?? fail(400);
    const event = eventId == null ? { participantIds: [] } as Row : this.db.findOrFail('events', eventId);
    Object.assign(event, {
      name: dto['name'] ?? null,
      description: dto['description'] ?? null,
      type: dto['type'] ?? null,
      initDate: this.toLocalDateTime(dto['initDate']),
      endDate: this.toLocalDateTime(dto['endDate']),
      placeId: dto['placeId'] == null || dto['placeId'] === '' ? null : String(dto['placeId']),
      ubication: dto['ubication'] ?? null,
      latitude: this.toNumber(dto['latitude']),
      longitude: this.toNumber(dto['longitude']),
      creatorId: user['id']
    });
    const saved = eventId == null ? this.db.insert('events', event) : event;
    if (eventId != null) this.db.remove('themes', t => t['eventId'] === eventId);
    for (const theme of dto['themes'] ?? []) this.db.insert('themes', { name: theme['name'], eventId: saved['id'] });
    if (req.files['file']) await this.replaceImage('EVENT', saved['id'], req.files['file']);
    return this.eventDto(saved);
  }

  private toNumber(value: unknown): number | null {
    if (value == null || value === '') return null;
    const n = Number(value);
    return isNaN(n) ? fail(400) : n;
  }

  private deleteEvent(id: number): null {
    this.db.findOrFail('events', id);
    this.deletePosts(p => p['eventId'] === id);
    this.db.remove('images', i => i['fromType'] === 'EVENT' && i['fromId'] === id);
    this.db.remove('themes', t => t['eventId'] === id);
    this.db.remove('comments', c => c['eventId'] === id);
    this.db.remove('events', e => e['id'] === id);
    return null;
  }

  private joinEvent(eventId: number, userId: number): Row {
    const event = this.db.findOrFail('events', eventId);
    this.db.findOrFail('users', userId);
    if (!event['participantIds'].includes(userId)) event['participantIds'].push(userId);
    return this.eventDto(event);
  }

  /** Mismos filtros que EventService.findAll (Specification de JPA), ordenados por fecha de inicio. */
  private findAllEvents(query: Record<string, string>): Row[] {
    const category = (query['category'] ?? '').trim();
    const groups: Record<string, string[]> = {
      music: ['Music'],
      food: ['Gastronomy'],
      outdoor: ['Sports', 'Travel & Tourism', 'Sustainability', 'Environment', 'Recreation & Leisure', 'Agriculture & AgriTech',
        'Environmental Care', 'Renewable Energy', 'Natural Disasters & Resilience', 'Virtual Travel', 'Animal Welfare', 'Ecosystem Restoration'],
      creative: ['Culture & Art', 'Creativity & Innovation', 'Photography', 'Literature', 'Fashion', 'Architecture', 'UX/UI Design',
        'Content Creation', 'Pop Culture', 'Movies & TV']
    };
    const themeNames = (groups[category.toLowerCase()] ?? (category ? [category] : [])).map(n => n.toLowerCase());
    const search = (query['search'] ?? '').trim().toLowerCase();
    const type = (query['type'] ?? '').trim().toLowerCase();
    const location = (query['location'] ?? '').trim().toLowerCase();
    const from = query['fromDate'] ? `${query['fromDate']}T00:00:00` : null;
    const to = query['toDate'] ? new Date(`${query['toDate']}T00:00:00`) : null;
    if (to) to.setDate(to.getDate() + 1);
    const toText = to ? localDateTime(to) : null;
    const typeValues = type === 'online' ? ['online', 'true'] : type === 'notonline' ? ['notonline', 'false'] : [type];

    return this.db.t('events').filter(e => {
      if (search && !`${e['name'] ?? ''}`.toLowerCase().includes(search) && !`${e['description'] ?? ''}`.toLowerCase().includes(search)) return false;
      if (type && !typeValues.includes(String(e['type'] ?? '').toLowerCase())) return false;
      if (location && !String(e['ubication'] ?? '').toLowerCase().includes(location)) return false;
      if (from && !(e['initDate'] && e['initDate'] >= from)) return false;
      if (toText && !(e['initDate'] && e['initDate'] < toText)) return false;
      if (themeNames.length && !this.db.t('themes').some(t => t['eventId'] === e['id'] && themeNames.includes(String(t['name']).toLowerCase()))) return false;
      return true;
    }).sort((a, b) => String(a['initDate'] ?? '').localeCompare(String(b['initDate'] ?? '')));
  }

  // ---------- Publicaciones y comentarios ----------

  private async createPost(req: DemoRequest): Promise<Row> {
    const user = this.authUser(req, false);
    const dto = req.body['post'] ?? fail(400);
    if (dto['event'] && dto['event']['id'] != null) this.db.findOrFail('events', Number(dto['event']['id']));
    const post = this.db.insert('posts', {
      description: dto['description'] ?? null,
      url: dto['url'] ?? null,
      creatorId: user['id'],
      eventId: dto['event']?.['id'] != null ? Number(dto['event']['id']) : null
    });
    for (const tag of dto['hashtags'] ?? []) this.db.insert('hashtags', { name: tag['name'], postId: post['id'] });
    if (req.files['file']) await this.replaceImage('POST', post['id'], req.files['file']);
    return this.postDto(post);
  }

  private deletePosts(predicate: (post: Row) => boolean): void {
    const ids = this.db.t('posts').filter(predicate).map(p => p['id']);
    this.db.remove('images', i => i['fromType'] === 'POST' && ids.includes(i['fromId']));
    this.db.remove('hashtags', h => ids.includes(h['postId']));
    this.db.remove('comments', c => ids.includes(c['postId']));
    this.db.remove('posts', p => ids.includes(p['id']));
  }

  private createComment(req: DemoRequest): Row {
    const user = this.authUser(req, false);
    const dto = req.body['comment'] ?? fail(400);
    const postId = dto['post']?.['id'] != null ? Number(dto['post']['id']) : null;
    const eventId = dto['event']?.['id'] != null ? Number(dto['event']['id']) : null;
    if (postId != null) this.db.findOrFail('posts', postId);
    if (eventId != null) this.db.findOrFail('events', eventId);
    const comment = this.db.insert('comments', { comment: dto['comment'], postId, eventId, userId: user['id'], createdAt: localDateTime(new Date()) });
    return { id: comment['id'], comment: comment['comment'], user: this.userDto(user), createdAt: comment['createdAt'] };
  }

  // ---------- Imágenes ----------

  private async replaceImage(fromType: string, fromId: number, file: File): Promise<void> {
    const url = await imageDataUrl(file);
    this.db.remove('images', i => i['fromType'] === fromType && i['fromId'] === fromId);
    this.db.insert('images', { url, fromType, fromId, isCover: true });
  }

  private imageDto(fromType: string, fromId: number): Row | null {
    const image = this.db.t('images').find(i => i['fromType'] === fromType && i['fromId'] === fromId);
    return image ? { id: image['id'], url: image['url'] } : null;
  }

  // ---------- Ubicaciones ----------

  private async searchPlaces(query: string): Promise<Row[]> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&accept-language=es&q=${encodeURIComponent(query)}`);
      if (response.ok) return await response.json();
    } catch { /* sin conexión con OpenStreetMap: usamos la lista local */ }
    const term = query.toLowerCase();
    return OFFLINE_PLACES.filter(([name]) => name.toLowerCase().includes(term))
      .map(([display_name, lat, lon], i) => ({ place_id: 900000 + i, display_name, lat: String(lat), lon: String(lon) }));
  }

  private async reverseGeocode(lat: number, lng: number): Promise<Row> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&accept-language=es&lat=${lat}&lon=${lng}`);
      if (response.ok) return await response.json();
    } catch { /* sin conexión con OpenStreetMap */ }
    return { lat: String(lat), lon: String(lng), display_name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
  }

  // ---------- DTO (mismos campos que los record de com.ubication.backend.dto) ----------

  private userDto(u: Row): Row {
    return {
      id: u['id'], name: u['name'], bio: u['bio'] ?? null, username: u['username'], email: u['email'],
      image: this.imageDto('USER', u['id']), banner: this.imageDto('USER_BANNER', u['id'])
    };
  }

  private eventDto(e: Row): Row {
    const creator = this.db.find('users', e['creatorId']);
    return {
      id: e['id'],
      initDate: e['initDate'],
      endDate: e['endDate'],
      placeId: e['placeId'],
      // Se usa el id del catálogo themes.json para que el frontend muestre el icono del tema.
      themes: this.db.t('themes').filter(t => t['eventId'] === e['id'])
        .map(t => ({ id: themesJson.find(j => j.name === t['name'])?.id ?? t['id'], name: t['name'] })),
      participants: e['participantIds'].map((id: number) => this.db.find('users', id)).filter(Boolean).map((u: Row) => this.userDto(u)),
      ubication: e['ubication'],
      latitude: e['latitude'],
      longitude: e['longitude'],
      name: e['name'],
      description: e['description'],
      type: e['type'],
      creator: creator ? this.userDto(creator) : null,
      image: this.imageDto('EVENT', e['id'])
    };
  }

  private postDto(p: Row): Row {
    const event = p['eventId'] != null ? this.db.find('events', p['eventId']) : undefined;
    const creator = this.db.find('users', p['creatorId']);
    return {
      id: p['id'],
      description: p['description'],
      url: p['url'],
      hashtags: this.db.t('hashtags').filter(h => h['postId'] === p['id']).map(h => ({ id: h['id'], name: h['name'] })),
      event: event ? this.eventDto(event) : null,
      creator: creator ? this.userDto(creator) : null,
      image: this.imageDto('POST', p['id']),
      comments: this.db.t('comments').filter(c => c['postId'] === p['id']).map(c => {
        const commentEvent = c['eventId'] != null ? this.db.find('events', c['eventId']) : undefined;
        const user = this.db.find('users', c['userId']);
        return {
          id: c['id'], comment: c['comment'], post: null, event: commentEvent ? this.eventDto(commentEvent) : null,
          user: user ? this.userDto(user) : null, createdAt: c['createdAt']
        };
      })
    };
  }

  // ---------- Chat (en la API real va por WebSocket/STOMP; aquí lo usa ChatService en modo demo) ----------

  sendChatMessage(message: Row): Row {
    const saved = this.db.insert('chat', {
      eventId: Number(message['eventId']), userId: Number(message['userId']), sender: message['sender'],
      content: message['content'], timestamp: localDateTime(new Date())
    });
    this.db.save();
    return saved;
  }

  /** Respuesta automática de otro participante, para que el chat no se sienta vacío en la demo. */
  autoReply(eventId: number, fromUserId: number): Row | null {
    const event = this.db.find('events', eventId);
    if (!event) return null;
    const others = [event['creatorId'], ...event['participantIds']].filter((id: number) => id !== fromUserId);
    const user = others.length ? this.db.find('users', others[Math.floor(Math.random() * others.length)]) : undefined;
    if (!user) return null;
    const replies = ['¡Genial! 🙌', '¡Nos vemos allí!', 'Me parece perfecto.', '¡Qué ganas!', 'Gracias por avisar 😊', '¡Apuntado!'];
    return this.sendChatMessage({ eventId, userId: user['id'], sender: user['username'], content: replies[Math.floor(Math.random() * replies.length)] });
  }
}
