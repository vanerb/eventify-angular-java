import {User} from './users';
import {Image} from './images';
import {Hashtag} from './hashtags';
import {Comment} from './comments';

export interface Post {
  comments: Comment[],
  creator: User,
  description: string,
  event: Event,
  hashtags: Hashtag[],
  id: number,
  image: Image,
  url: string
}


