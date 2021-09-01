import { PostDoc } from '@/types';
import { DBCollection } from './mongodb';
import { COLLECTION_POST } from './consts';

class PostDocCollection extends DBCollection<PostDoc> {
  constructor() {
    super(COLLECTION_POST);
  }

  async distinct<V extends keyof PostDoc>(field: V) {
    const collection = this.getCollection();
    return collection.distinct(field);
  }
}

export const postDocCollection = new PostDocCollection();