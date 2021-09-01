import { ApiContext } from './context';

import { LEVEL_AUTHOR, UcsDoc } from '../types';
import { ucsDocCollection } from '../db/UcsDoc';
import { updateUcs } from '../util/ucscrawl';

export async function searchUcsById(ctx: ApiContext, id: number, crawlMode: boolean): Promise<UcsDoc | null> {
    if (LEVEL_AUTHOR > ctx.userLevel)
        throw new Error('access denied');

    if (!id)
        throw new Error(`invalid parameter`);

    if (crawlMode)
        return updateUcs(id);

    return ucsDocCollection.findOne({ id }, { projection: { file: 0 } });
}