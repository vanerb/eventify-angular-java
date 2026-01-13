import {User} from './users';
import {Image} from './images';
import {Theme} from './themes';
import {Page} from './pagination';

export interface Event{
  id: number,
  creator: User,
  description: string,
  endDate: string,
  image: Image,
  initDate: string,
  latitude: number,
  longitude: number,
  name: string,
  participants: User[],
  placeId: string,
  themes: Theme[],
  type: string,
  ubication: string,
}

export type EventPage = Page<Event>;
