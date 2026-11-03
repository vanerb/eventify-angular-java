import { Row } from './demo-store';

/** Contraseña común de todas las cuentas de prueba de la demo. */
export const DEMO_PASSWORD = 'Demo1234';

/** Fecha en el formato en que la API serializa LocalDateTime (sin zona ni milisegundos). */
export function localDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Día relativo a hoy a una hora concreta: así los eventos de muestra siempre son próximos. */
function day(offset: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, minute, 0, 0);
  return localDateTime(date);
}

const svg = (body: string, w: number, h: number) =>
  'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`);

/** Portada ilustrada para eventos y publicaciones (sin depender de imágenes externas). */
function cover(title: string, from: string, to: string, emoji: string): string {
  title = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return svg(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
    `<rect width="800" height="500" fill="url(#g)"/><circle cx="650" cy="110" r="150" fill="#ffffff22"/><circle cx="120" cy="430" r="190" fill="#00000014"/>` +
    `<text x="400" y="250" font-size="150" text-anchor="middle" dominant-baseline="middle">${emoji}</text>` +
    `<text x="400" y="420" font-family="sans-serif" font-size="38" font-weight="700" fill="#fff" text-anchor="middle">${title}</text>`,
    800, 500
  );
}

function avatar(initials: string, color: string): string {
  return svg(
    `<rect width="200" height="200" fill="${color}"/><text x="100" y="108" font-family="sans-serif" font-size="80" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${initials}</text>`,
    200, 200
  );
}

function banner(from: string, to: string): string {
  return svg(
    `<defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
    `<rect width="1200" height="300" fill="url(#b)"/><circle cx="1050" cy="40" r="160" fill="#ffffff22"/><circle cx="200" cy="320" r="140" fill="#ffffff18"/>`,
    1200, 300
  );
}

const users: Row[] = [
  { id: 1, email: 'lucia@eventify.demo', name: 'Lucía Romero', username: 'lucia', bio: 'Organizo conciertos y quedadas de música en directo por Madrid.' },
  { id: 2, email: 'marc@eventify.demo', name: 'Marc Puig', username: 'marcpuig', bio: 'Montañero, fotógrafo de fin de semana y fan de las rutas al aire libre.' },
  { id: 3, email: 'sara@eventify.demo', name: 'Sara Benítez', username: 'sarab', bio: 'Cocinera aficionada. Me encantan los mercados y los talleres de gastronomía.' },
  { id: 4, email: 'diego@eventify.demo', name: 'Diego Alonso', username: 'diegodev', bio: 'Desarrollador web. Voy a todos los meetups de tecnología que puedo.' }
];

const colors = ['#7454d8', '#e0698b', '#2f9e7a', '#e29a2b'];
const banners: [string, string][] = [['#7454d8', '#c86dd7'], ['#2f80ed', '#56ccf2'], ['#f2994a', '#eb5757'], ['#11998e', '#38ef7d']];

// [nombre, descripción, tipo, inicio, fin, lugar, lat, lon, creador, participantes, temas, portada]
type EventSeed = [string, string, 'online' | 'notOnline', string, string, string | null, number | null, number | null, number, number[], string[], [string, string, string]];

const eventSeeds: EventSeed[] = [
  ['Concierto acústico en el Retiro', 'Tarde de música en directo junto al estanque: guitarras, voces y mantas sobre la hierba. Trae algo para compartir.', 'notOnline',
    day(2, 18, 30), day(2, 21), 'Parque del Retiro, Madrid, Comunidad de Madrid, España', 40.4153, -3.6845, 1, [2, 3], ['Music', 'Recreation & Leisure'], ['#7454d8', '#c86dd7', '🎸']],
  ['Ruta por el Montseny', 'Excursión de unos 14 km con 700 m de desnivel. Salida desde Santa Fe del Montseny. Nivel medio.', 'notOnline',
    day(5, 8), day(5, 16), 'Parc Natural del Montseny, Barcelona, Cataluña, España', 41.7769, 2.4307, 2, [1, 4], ['Sports', 'Travel & Tourism'], ['#11998e', '#38ef7d', '⛰️']],
  ['Taller de paella valenciana', 'Aprende a cocinar una paella tradicional con una cocinera local. Incluye degustación y receta en PDF.', 'notOnline',
    day(7, 12), day(7, 15), 'Mercado Central, Valencia, Comunidad Valenciana, España', 39.4734, -0.3790, 3, [1], ['Gastronomy', 'Culture & Art'], ['#f2994a', '#eb5757', '🥘']],
  ['Meetup Angular & Spring Boot', 'Charlas cortas sobre Angular con señales, Spring Boot 3 y despliegue de aplicaciones full stack. Networking al final.', 'online',
    day(3, 19), day(3, 21), null, null, null, 4, [1, 2, 3], ['Technology', 'Education'], ['#2f80ed', '#56ccf2', '💻']],
  ['Ruta fotográfica por el casco antiguo', 'Paseo al atardecer para practicar fotografía urbana. Cualquier cámara vale, también el móvil.', 'notOnline',
    day(9, 18), day(9, 20, 30), 'Plaza de España, Sevilla, Andalucía, España', 37.3772, -5.9869, 2, [3], ['Photography', 'Culture & Art'], ['#f6d365', '#fda085', '📷']],
  ['Club de lectura online', 'Este mes comentamos una novela corta. Conexión por videollamada; el enlace se comparte en el chat del evento.', 'online',
    day(4, 20), day(4, 21, 30), null, null, null, 3, [1, 4], ['Literature', 'Education'], ['#a18cd1', '#fbc2eb', '📚']],
  ['Festival de jazz en la playa', 'Tres bandas locales sobre el escenario de la playa. Entrada libre hasta completar aforo.', 'notOnline',
    day(12, 20), day(13, 0, 30), 'Playa de la Malvarrosa, Valencia, Comunidad Valenciana, España', 39.4781, -0.3237, 1, [3, 4], ['Music'], ['#232526', '#7454d8', '🎷']],
  ['Voluntariado de limpieza de costa', 'Jornada de recogida de residuos en la playa. Se proporcionan guantes y bolsas.', 'notOnline',
    day(6, 10), day(6, 13), 'Playa de la Concha, San Sebastián, País Vasco, España', 43.3183, -1.9866, 2, [], ['Sustainability', 'Environmental Care'], ['#43cea2', '#185a9d', '🌊']],
  ['Cata de vinos y quesos', 'Cata guiada de cinco vinos de la Rioja maridados con quesos artesanos.', 'notOnline',
    day(15, 19), day(15, 21), 'Calle Laurel, Logroño, La Rioja, España', 42.4655, -2.4475, 3, [2], ['Gastronomy'], ['#8e2de2', '#4a00e0', '🍷']],
  ['Hackathon de sostenibilidad', '24 horas para crear prototipos que ayuden a reducir el consumo energético. Equipos de 3 a 5 personas.', 'notOnline',
    day(20, 9), day(21, 9), 'La Térmica, Málaga, Andalucía, España', 36.6925, -4.4450, 4, [2], ['Technology', 'Sustainability'], ['#00b09b', '#96c93d', '🚀']],
  ['Clase de yoga al amanecer', 'Sesión de yoga suave para todos los niveles. Trae tu esterilla.', 'notOnline',
    day(1, 7, 30), day(1, 8, 30), 'Parque Grande José Antonio Labordeta, Zaragoza, Aragón, España', 41.6339, -0.8995, 1, [3], ['Health & Wellness', 'Sports'], ['#ffecd2', '#fcb69f', '🧘']],
  ['Webinar: marketing para eventos', 'Cómo dar a conocer tu evento en redes sociales con poco presupuesto.', 'online',
    day(10, 17), day(10, 18), null, null, null, 4, [1], ['Digital Marketing', 'Entrepreneurship'], ['#ee0979', '#ff6a00', '📣']]
];

const posts: [number, number, string, string | null, string[], [string, string, string]][] = [
  // [creador, evento, descripción, enlace, hashtags, portada]
  [2, 1, '¡Qué ganas del concierto en el Retiro! Llevaré la guitarra por si alguien se anima a tocar después.', null, ['musica', 'retiro'], ['#7454d8', '#c86dd7', '🎶']],
  [1, 2, 'Preparando la mochila para el Montseny. ¿Alguien sabe si habrá fuentes por el camino?', null, ['senderismo', 'montseny'], ['#11998e', '#38ef7d', '🥾']],
  [4, 4, 'Ya está la agenda del meetup: tres charlas de 15 minutos y turno de preguntas. Os dejo el enlace al repositorio de ejemplo.', 'https://github.com/vanerb/Eventify-angular-java', ['angular', 'springboot', 'meetup'], ['#2f80ed', '#56ccf2', '🧑‍💻']],
  [3, 3, 'El arroz ya está comprado para el taller. Recordad que el secreto está en el socarrat 😋', null, ['paella', 'valencia'], ['#f2994a', '#eb5757', '🍚']],
  [2, 5, 'Algunas pruebas de luz para la ruta fotográfica de Sevilla. ¡El atardecer en la plaza es espectacular!', null, ['fotografia', 'sevilla'], ['#f6d365', '#fda085', '🌇']],
  [1, 7, 'Confirmadas las tres bandas del festival de jazz. Nos vemos en la Malvarrosa.', null, ['jazz', 'festival'], ['#232526', '#7454d8', '🎺']]
];

const comments: [number, number, string, number][] = [
  // [publicación, usuario, comentario, minutos atrás]
  [1, 1, '¡Genial! Así hacemos una jam al final.', 180],
  [1, 3, 'Yo llevo tortilla para compartir 🙌', 120],
  [2, 2, 'Hay una fuente en el Collformic, pero mejor llevar 2 litros por persona.', 300],
  [3, 1, 'Me apunto a la charla de señales, tengo muchas dudas.', 90],
  [3, 2, '¿Se grabarán las charlas?', 60],
  [4, 1, 'Allí estaré, ¡con hambre!', 45],
  [5, 3, 'Qué colores tan bonitos.', 30]
];

const chat: [number, number, string, number][] = [
  // [evento, usuario, mensaje, minutos atrás]
  [1, 1, '¡Hola a todos! Nos vemos en la entrada de la Puerta de Alcalá.', 1500],
  [1, 2, 'Perfecto, llegaré un poco antes para coger sitio.', 1440],
  [1, 3, '¿Alguien sabe si se puede llevar comida?', 200],
  [1, 1, 'Sí, sin problema. ¡Trae lo que quieras compartir!', 190],
  [4, 4, 'Bienvenidos al chat del meetup. Compartiré el enlace de la videollamada aquí.', 600],
  [4, 1, '¡Gracias! ¿Habrá turno de preguntas?', 540],
  [4, 4, 'Sí, al final de cada charla.', 530],
  [2, 2, 'Salida a las 8:00 desde el aparcamiento de Santa Fe.', 400],
  [2, 4, '¡Allí estaré!', 350]
];

/** Tablas iniciales de la demo, con la misma estructura que las entidades JPA de la API. */
export function buildSeed(): Record<string, Row[]> {
  const images: Row[] = [];
  const addImage = (fromType: string, fromId: number, url: string) =>
    images.push({ id: images.length + 1, url, fromType, fromId, isCover: true });

  users.forEach((u, i) => {
    addImage('USER', u['id'], avatar(u['name'].split(' ').map((p: string) => p[0]).join(''), colors[i]));
    addImage('USER_BANNER', u['id'], banner(...banners[i]));
  });

  const themes: Row[] = [];
  const events: Row[] = eventSeeds.map(([name, description, type, initDate, endDate, ubication, latitude, longitude, creatorId, participantIds, themeNames, art], i) => {
    const id = i + 1;
    themeNames.forEach(themeName => themes.push({ id: themes.length + 1, name: themeName, eventId: id }));
    addImage('EVENT', id, cover(name.length > 32 ? name.slice(0, 30) + '…' : name, ...art));
    return {
      id, name, description, type, initDate, endDate, ubication, latitude, longitude, creatorId, participantIds,
      placeId: ubication ? String(200000 + id) : null
    };
  });

  const hashtags: Row[] = [];
  const postRows: Row[] = posts.map(([creatorId, eventId, description, url, tags, art], i) => {
    const id = i + 1;
    tags.forEach(name => hashtags.push({ id: hashtags.length + 1, name, postId: id }));
    addImage('POST', id, cover('#' + tags[0], ...art));
    return { id, description, url, creatorId, eventId };
  });

  const ago = (minutes: number) => localDateTime(new Date(Date.now() - minutes * 60000));

  return {
    users: users.map(u => ({ ...u, password: DEMO_PASSWORD, token: null })),
    images,
    events,
    themes,
    posts: postRows,
    hashtags,
    comments: comments.map(([postId, userId, comment, minutes], i) => ({ id: i + 1, comment, postId, eventId: null, userId, createdAt: ago(minutes) })),
    chat: chat.map(([eventId, userId, content, minutes], i) => ({
      id: i + 1, eventId, userId, sender: users.find(u => u['id'] === userId)!['username'], content, timestamp: ago(minutes)
    }))
  };
}
