import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-paginator',
  imports: [
    MatButton,
    NgIf
  ],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
  standalone: true
})
export class Paginator implements OnInit {
  showPage: number = 0
  @Input() type: 'small' | 'medium' = 'medium'
  @Input() limit: number = 20
  @Input() params!: {
    numberElements: number,
    totalPages: number,
    page: number
  }
  @Output() update = new EventEmitter();

  ngOnInit() {
    this.showPage += 1
  }

  changePage(type: 'next' | 'previous') {
    if (type === 'previous') {
      if ( this.params.page > 0) {
        this.params.page--;
        this.showPage -= 1
      }
    } else if (type === 'next') {
      this.params.page++;
      this.showPage += 1
    }

    this.update.emit({
      page:  this.params.page,
      limit: this.limit
    });
  }
}
