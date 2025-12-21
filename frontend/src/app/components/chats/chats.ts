import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ChatService} from '../../services/chat-service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {Container} from '../general/container/container';
import {HttpClient} from '@angular/common/http';
import {EventSevice} from '../../services/event-sevice';
import {sleep, transformDate, transformDateHour} from '../../services/utilities-service';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {AuthService} from '../../services/auth-service';
import {firstValueFrom, Subscription} from 'rxjs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatChipRow} from '@angular/material/chips';
import {CardEvents} from '../events/card-events/card-events';
import {ChatMessage} from '../../models/chats';

@Component({
  selector: 'app-chats',
  imports: [
    FormsModule,
    NgForOf,
    Container,
    MatSidenavModule,
    MatDividerModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    NgIf,
    MatExpansionModule,
    MatChipRow,
    CardEvents
  ],
  templateUrl: './chats.html',
  styleUrl: './chats.css',
  standalone: true
})
export class Chats implements OnInit, OnDestroy, AfterViewInit {
  messages: ChatMessage[] = [];
  newMessage = '';
  eventId: number | null = null;
  events: any[] = [];
  user!: any;

  private messagesSub?: Subscription;
  private messageDdbbSub?: Subscription;

  groupedMessages: { date: string, messages: any[] }[] = [];
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

  ngAfterViewInit() {
    this.eventService.getMyEventParticipations().subscribe((events) => {
      this.events = events;
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
  protected readonly transformDate = transformDate;
}
