import {Post} from './posts';
import {User} from './users';

export interface Comment{
  comment: string,
  createdAt: string,
  event: Event,
  id: number,
  post: Post,
  user: User,
}
