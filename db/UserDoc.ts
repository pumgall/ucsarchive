import { UserDoc } from '@/types';

import { DBCollection } from './mongodb';
import { COLLECTION_USER } from './consts';

class UserDocCollection extends DBCollection<UserDoc> {
    constructor() {
        super(COLLECTION_USER);
    }
}

export const userDocCollection = new UserDocCollection();