import { UcsDoc } from '@/types';

import { DBCollection } from './mongodb';
import { COLLECTION_UCS } from './consts';

class UcsDocCollection extends DBCollection<UcsDoc> {
    constructor() {
        super(COLLECTION_UCS);
    }
}

export const ucsDocCollection = new UcsDocCollection();