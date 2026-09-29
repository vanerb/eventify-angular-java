import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  signal
} from '@angular/core';

import {ChatService} from '../../services/chat-service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {Container} from '../general/container/container';
import {HttpClient} from '@angular/common/http';
import {EventSevice} from '../../services/event-sevice';
import {transformDateHour} from '../../services/utilities-service';
import {AuthService} from '../../services/auth-service';
import {firstValueFrom, Subscription} from 'rxjs';
import {ChatMessage} from '../../models/chats';
import {Paginator} from '../general/paginator/paginator';
import {User} from '../../models/users';
import {EventPage, Event} from '../../models/events';

@Component({
  selector: 'app-chats',
  imports: [
    FormsModule,
    NgForOf,
    Container,
    NgIf,
    Paginator
  ],
  templateUrl: './chats.html',
  styleUrl: './chats.css',
  standalone: true
})
export class Chats implements OnInit, OnDestroy, AfterViewInit {

  messages = signal<ChatMessage[]>([]);

  newMessage = signal<string>('');

  eventId = signal<number | null>(null);

  events = signal<Event[]>([]);

  eventPagination = signal<EventPage | undefined>(undefined);

  user = signal<User | undefined>(undefined);

  page = signal<number>(0);

  limit = signal<number>(20);

  groupedMessages = signal<{
    date: string;
    messages: any[];
  }[]>([]);

  private messagesSub?: Subscription;

  private messageDdbbSub?: Subscription;

  @ViewChild('bottom')
  bottom!: ElementRef;

  constructor(
    private chatService: ChatService,
    private http: HttpClient,
    private eventService: EventSevice,
    private readonly authService: AuthService,
  ) {}

  async ngOnInit() {

    const user = await firstValueFrom(
      this.authService.getUserByToken()
    );

    this.user.set(user);
  }

  updatePagination(page: number, limit: number) {

    this.page.set(page);

    this.limit.set(limit);

    this.updateParticipations();
  }

  ngAfterViewInit() {

    this.updateParticipations();
  }

  updateParticipations() {

    this.eventService
      .getMyEventParticipations(
        this.page(),
        this.limit()
      )
      .subscribe((events: EventPage) => {

        this.events.set(events.content);

        this.eventPagination.set(events);
      });
  }

  get selectedEvent(): Event | undefined {

    const currentEventId = this.eventId();

    return this.events().find(
      event => event.id === currentEventId
    );
  }

  /** AGRUPAR */
  groupMessagesByDate() {

    const groups: {
      [key: string]: any[]
    } = {};

    this.messages().forEach(msg => {

      const dateStr = new Date(
        msg.timestamp ?? ''
      ).toLocaleDateString();

      (groups[dateStr] ??= []).push(msg);
    });

    this.groupedMessages.set(
      Object.entries(groups).map(
        ([date, messages]) => ({
          date,
          messages
        })
      )
    );
  }

  /** CONEXIÓN WEBSOCKET */
  initConnection() {

    const currentEventId = this.eventId();

    if (!currentEventId) {
      return;
    }

    this.messages.set([]);

    this.chatService.connect(currentEventId);

    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }

    this.messagesSub =
      this.chatService.messages$.subscribe(msg => {

        const exists = this.messages().some(m =>
          m.userId === msg.userId &&
          m.timestamp === msg.timestamp
        );

        if (!exists) {

          this.messages.update(
            messages => [...messages, msg]
          );

          this.groupMessagesByDate();
        }
      });

    this.refreshMessages();
  }

  /** CARGA INICIAL DE MENSAJES */
  refreshMessages() {

    const currentEventId = this.eventId();

    if (!currentEventId) {
      return;
    }

    if (this.messageDdbbSub) {
      this.messageDdbbSub.unsubscribe();
    }

    this.messageDdbbSub = this.http
      .get<ChatMessage[]>(
        `http://localhost:8080/api/chat/${currentEventId}`
      )
      .subscribe(msgs => {

        this.messages.set(msgs);

        this.groupMessagesByDate();

        setTimeout(() => {

          this.bottom.nativeElement.scrollIntoView({
            behavior: 'auto'
          });

        }, 0);
      });
  }

  /** ENVIAR MENSAJE */
  sendMessage() {

    const currentMessage = this.newMessage().trim();

    const currentEventId = this.eventId();

    const currentUser = this.user();

    if (
      !currentMessage ||
      !currentEventId ||
      !currentUser
    ) {
      return;
    }

    const message: ChatMessage = {
      sender: currentUser.username,
      content: currentMessage,
      timestamp: new Date().toISOString(),
      eventId: currentEventId,
      userId: currentUser.id
    };

    this.chatService.sendMessage(message);

    this.newMessage.set('');

    setTimeout(
      () => this.refreshMessages(),
      200
    );

    setTimeout(() => {

      this.bottom.nativeElement.scrollIntoView({
        behavior: 'auto'
      });

    }, 0);
  }

  /** CAMBIAR EVENTO */
  changeEvent(id: number | null) {

    if (id === this.eventId()) {
      return;
    }

    this.eventId.set(id);

    this.messages.set([]);

    this.groupedMessages.set([]);

    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }

    this.initConnection();
  }

  ngOnDestroy() {

    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }

    if (this.messageDdbbSub) {
      this.messageDdbbSub.unsubscribe();
    }

    this.chatService.disconnect();
  }

  protected readonly transformDateHour = transformDateHour;
}