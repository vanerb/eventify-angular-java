import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgIf} from '@angular/common';
import {Page} from '../../../models/pagination';

@Component({
  selector: 'app-paginator',
  imports: [NgIf],
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
      if (this.params.number <= 0) return;
      this.params.number--;
    } else if (type === 'next') {
      if (this.params.number >= this.params.totalPages - 1) return;
      this.params.number++;
    }

    this.showPage = this.params.number + 1;

    this.update.emit({
      page:  this.params.number,
      limit: this.limit
    });
  }
}
