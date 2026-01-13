import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {Page} from '../../../models/pagination';

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
  @Input() params!: Page<any>
  @Output() update = new EventEmitter();

  ngOnInit() {
    this.showPage += 1
  }

  changePage(type: 'next' | 'previous') {
    if (type === 'previous') {
      if ( this.params.number > 0) {
        this.params.number--;
        this.showPage -= 1
      }
    } else if (type === 'next') {
      this.params.number++;
      this.showPage += 1
    }

    this.update.emit({
      page:  this.params.number,
      limit: this.limit
    });
  }
}
