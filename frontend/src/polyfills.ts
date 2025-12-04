// polyfills.ts
// 👇 Definir global y process antes de cargar cualquier otra cosa
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};

// 👇 Buffer también puede ser necesario
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
