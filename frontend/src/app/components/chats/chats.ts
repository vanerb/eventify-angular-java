import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
  messages: ChatMessage[] = [];
  newMessage = '';
  eventId: number | null = null;
  events: Event[] = [];
  eventPagination!: EventPage
  user!: User;

  page: number = 0;
  limit: number = 20;

  private messagesSub?: Subscription;
  private messageDdbbSub?: Subscription;

  groupedMessages: { date: string, messages: any[] }[] = [];
  get selectedEvent(): Event | undefined {
    return this.events.find(event => event.id === this.eventId);
  }
  @ViewChild('bottom') bottom!: ElementRef;

  constructor(
    private chatService: ChatService,
    private http: HttpClient,
    private eventService: EventSevice,
    private readonly authService: AuthService,
  ) {}

  async ngOnInit() {
    this.user = await firstValueFrom(this.authService.getUserByToken());

  }

  updatePagination(page: number, limit: number){
    this.page = page
    this.limit = limit
    this.updateParticipations()
  }

  ngAfterViewInit() {
   this.updateParticipations()
  }


  updateParticipations(){
    this.eventService.getMyEventParticipations(this.page, this.limit).subscribe((events: EventPage) => {
      this.events = events.content;
      this.eventPagination = events
    });
  }




  /** AGRUPAR */
  groupMessagesByDate() {
    const groups: { [key: string]: any[] } = {};

    this.messages.forEach(msg => {
      const dateStr = new Date(msg.timestamp ?? '').toLocaleDateString();
      (groups[dateStr] ??= []).push(msg);
    });

    this.groupedMessages = Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  }

  /** CONEXIÓN WEBSOCKET */
  initConnection() {
    if (!this.eventId) return;

    this.messages = [];

    this.chatService.connect(this.eventId);

    if (this.messagesSub) this.messagesSub.unsubscribe();

    this.messagesSub = this.chatService.messages$.subscribe(msg => {
      const exists = this.messages.some(m =>
        m.userId === msg.userId &&
        m.timestamp === msg.timestamp
      );

      if (!exists) {
        this.messages.push(msg);
        this.groupMessagesByDate();
      }
    });

    this.refreshMessages();
  }

  /** CARGA INICIAL DE MENSAJES */
  refreshMessages() {
    if (!this.eventId) return;

    if (this.messageDdbbSub) this.messageDdbbSub.unsubscribe();

    this.messageDdbbSub = this.http
      .get<ChatMessage[]>(`http://localhost:8080/api/chat/${this.eventId}`)
      .subscribe(msgs => {
        this.messages = msgs;
        this.groupMessagesByDate();

        setTimeout(() => {
          this.bottom.nativeElement.scrollIntoView({ behavior: 'auto' });
        }, 0);

      });


  }

  /** ENVIAR MENSAJE */
  sendMessage() {
    if (!this.newMessage.trim() || !this.eventId) return;

    const message: ChatMessage = {
      sender: this.user.username,
      content: this.newMessage,
      timestamp: new Date().toISOString(),
      eventId: this.eventId,
      userId: this.user.id
    };

    this.chatService.sendMessage(message);
    this.newMessage = '';

    setTimeout(() => this.refreshMessages(), 200);
    setTimeout(() => {
      this.bottom.nativeElement.scrollIntoView({ behavior: 'auto' });
    }, 0);
  }

  /** CAMBIAR EVENTO */
  changeEvent(id: number | null) {
    if (id === this.eventId) return;

    this.eventId = id;
    this.messages = [];



    if (this.messagesSub) this.messagesSub.unsubscribe();

    this.initConnection();


  }

  ngOnDestroy() {
    if (this.messagesSub) this.messagesSub.unsubscribe();
    if (this.messageDdbbSub) this.messageDdbbSub.unsubscribe();

    this.chatService.disconnect();
  }

  protected readonly transformDateHour = transformDateHour;
}
