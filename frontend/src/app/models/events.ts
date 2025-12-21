import {User} from './users';
import {Image} from './images';
import {Theme} from './themes';

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

