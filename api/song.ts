import { ApiContext } from './context';

import { LEVEL_AUTHOR } from '../types';
import { songDocCollection } from '../db/SongDoc';

export async function songInfo(ctx: ApiContext, id: string) {
  if (LEVEL_AUTHOR > ctx.userLevel)
    throw new Error('access denied');

  if (!id)
    throw new Error(`invalid parameter`);

  return songDocCollection.findOne({ id });
}

export async function songList(ctx: ApiContext) {
  return songDocCollection.findToArray({}, {});
}