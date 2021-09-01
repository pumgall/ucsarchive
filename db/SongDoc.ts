import { SongDoc } from '@/types';

import { DBCollection } from './mongodb';
import { COLLECTION_SONG } from './consts';

class SongDocCollection extends DBCollection<SongDoc> {
    constructor() {
        super(COLLECTION_SONG);
    }
}

export const songDocCollection = new SongDocCollection();