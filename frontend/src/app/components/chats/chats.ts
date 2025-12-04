import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ChatMessage} from '../../models/chat-message';
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
    MatChipRow
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
  private messagesSub!: Subscription;
  private messageDdbbSub!: Subscription;

  groupedMessages: { date: string, messages: any[] }[] = [];

  constructor(
    private chatService: ChatService,
    private http: HttpClient,
    private eventService: EventSevice,
    private readonly authService: AuthService,
  ) {
  }

  async ngAfterViewInit() {

    this.user = await firstValueFrom(this.authService.getUserByToken());
  }


   ngOnInit() {

    this.eventService.getMyEventParticipations().subscribe((events) => {
      this.events = events;
    });

    this.initConnection();

  }

  groupMessagesByDate() {
    const groups: { [key: string]: any[] } = {};

    this.messages.forEach(msg => {
      const date = new Date(msg.timestamp ?? '');
      const dateString = date.toLocaleDateString(); // "4/12/2025"

      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(msg);
    });

    this.groupedMessages = Object.keys(groups).map(date => ({
      date,
      messages: groups[date]
    }));
  }



  initConnection() {
    if (!this.eventId) return;

    this.messages = [];

    this.chatService.connect(this.eventId);

    this.messagesSub = this.chatService.messages$.subscribe(msg => {
      // Evitar duplicados
      const exists = this.messages.some(
        m => m.userId === msg.userId && m.timestamp === msg.timestamp
      );
      if (!exists) {
        this.messages.push(msg);
      }
    });


    this.refreshMessages()
  }

  refreshMessages() {
    if (this.messageDdbbSub) this.messageDdbbSub.unsubscribe();

    this.messageDdbbSub = this.http.get<ChatMessage[]>(`http://localhost:8080/api/chat/${this.eventId}`)
      .subscribe(msgs => {
        this.messages = msgs;
        this.groupMessagesByDate()
      });


    console.log("AAA", this.groupedMessages)
  }

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

    //this.messages.push(message);

    this.newMessage = '';


    setTimeout(() => this.refreshMessages(), 200);

  }

  changeEvent(id: number | null) {
    this.messages = []

    this.eventId = id;

    this.refreshMessages()

    if (id === this.eventId) return;

    if (this.messagesSub) this.messagesSub.unsubscribe();

    this.initConnection();
  }

  ngOnDestroy() {
    if (this.messagesSub) this.messagesSub.unsubscribe();
    this.chatService.disconnect();
  }

  protected readonly transformDateHour = transformDateHour;
  protected readonly transformDate = transformDate;
}
