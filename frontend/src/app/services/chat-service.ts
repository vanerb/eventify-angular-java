import {Injectable} from '@angular/core';
import {Client, Message} from '@stomp/stompjs';
import {Subject} from 'rxjs';
import {ChatMessage} from '../models/chat-message';


@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private client!: Client;
  private connected = false;
  private currentEventId: number | null = null;

  private messageSubject = new Subject<ChatMessage>();
  public messages$ = this.messageSubject.asObservable();

  constructor() {
    this.initClient();
  }

  /** INICIALIZAR CLIENTE */
  private initClient() {
    import('sockjs-client').then((SockJS) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS.default('http://localhost:8080/ws'),
        reconnectDelay: 5000,
        debug: (str) => console.log(str),
      });

      this.client.onConnect = () => {
        console.log('Conectado al WebSocket');
        this.connected = true;

        if (this.currentEventId) {
          this.subscribeToEvent(this.currentEventId);
        }
      };

      this.client.onDisconnect = () => {
        console.log("WebSocket desconectado");
        this.connected = false;
      };

      this.client.onStompError = (frame) => {
        console.error('Error STOMP: ', frame);
      };

      this.client.activate();
    });
  }

  /** CONECTAR / REACTIVAR */
  connect(eventId: number) {
    this.currentEventId = eventId;

    if (!this.connected) {
      console.log("Reactivando WebSocket…");
      this.client.activate();
      return;
    }

    this.subscribeToEvent(eventId);
  }

  /** SUSCRIPCIÓN */
  private subscribeToEvent(eventId: number) {
    this.client.subscribe(`/topic/event/${eventId}`, (msg: Message) => {
      const message: ChatMessage = JSON.parse(msg.body);
      this.messageSubject.next(message);
    });

    console.log('Suscrito al evento ' + eventId);
  }

  /** ENVIAR */
  sendMessage(message: ChatMessage) {
    if (!this.connected) {
      console.warn('Cliente no conectado');
      return;
    }

    const payload = { ...message };
    delete (payload as any).local;

    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(payload),
    });
  }

  /** DESCONECTAR */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
    this.connected = false;
  }
}
