import { PostParamDoc } from '@/types';
import { DBCollection } from './mongodb';
import { COLLECTION_POST_PARAM } from './consts';

class PostParamDocCollection extends DBCollection<PostParamDoc> {
  constructor() {
    super(COLLECTION_POST_PARAM);
  }
}

export const postParamDocCollection = new PostParamDocCollection();