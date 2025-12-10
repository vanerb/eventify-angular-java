import { Component } from '@angular/core';
import {Container} from '../general/container/container';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-profile',
  imports: [Container,MatTabsModule,MatDividerModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true
})
export class Profile {

}
