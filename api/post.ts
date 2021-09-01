import sanitizeHtml from 'sanitize-html';

import { ApiContext } from './context';

import { LEVEL_AUTHOR, PostDoc } from '../types';
import { postDocCollection } from '../db/PostDoc';
import { postParamDocCollection } from '../db/PostParamDoc';
import { ucsDocCollection } from '../db/UcsDoc';
import { songDocCollection } from '../db/SongDoc';

/*
export async function newPost(ctx: ApiContext, doc: PostDoc) {
  if (LEVEL_AUTHOR > ctx.userLevel)
    throw new Error('access denied');

  if (!doc?.id)
    throw new Error('invalid parameter');

  if (await postDocCollection.findOne({ _id: doc.id.toString() }))
    throw new Error('already exists ucs');

  const ucsDoc = await ucsDocCollection.findOne({ _id: doc.id.toString() });
  if (!ucsDoc)
    throw new Error('not found ucs doc');

  const songDoc = await songDocCollection.findOne({ _id: ucsDoc.songId });
  if (!songDoc)
    throw new Error('not found song doc');

  const author = ctx.userId;
  const newDoc: PostDoc = {
    ...doc,
    _id: doc.id.toString(),
    time: doc.time || new Date(),
    author,
    description: filteringHTML(doc.description),
    ucs: ucsDoc,
    song: songDoc,
  }

  await postDocCollection.insertOne(newDoc);

  await updatePostParam();
}
*/

export async function updatePost(ctx: ApiContext, doc: PostDoc) {
  if (LEVEL_AUTHOR > ctx.userLevel)
    throw new Error('access denied');

  if (!doc?.id)
    throw new Error('invalid parameter');

  const ucsDoc = await ucsDocCollection.findOne({ _id: doc.id.toString() });
  if (!ucsDoc)
    throw new Error('not found ucs doc');

  const songDoc = await songDocCollection.findOne({ _id: ucsDoc.songId });
  if (!songDoc)
    throw new Error('not found song doc');

  const author = ctx.userId;
  const newDoc: PostDoc = {
    ...doc,
    _id: doc.id.toString(),
    time: doc.time || new Date(),
    author,
    description: filteringHTML(doc.description || ''),
    ucs: ucsDoc,
    song: songDoc,
  }

  await postDocCollection.updateOne(
    { _id: newDoc._id, author },
    { $set: newDoc },
    { upsert: true }
  );

  await updatePostParam();
}

export async function deletePost(ctx: ApiContext, id: string) {
  if (LEVEL_AUTHOR > ctx.userLevel)
    throw new Error('access denied');

  if (!id)
    throw new Error('invalid parameter');

  await postDocCollection.deleteOne({ _id: id, author: ctx.userId });
}

export async function postList(ctx: ApiContext, filterField: string, filterData: string[]) {
  const param: Parameters<typeof postDocCollection.findToArray>[0] = {};
  if (filterField && filterData?.length) {
    param[filterField] = { $in: filterData };
  }

  return postDocCollection.findToArray(param, { projection: { 'ucs.file': 0 } });
}

async function updatePostParam() {
  // this function must be refactored...

  const [authors, tags, makers, songs] = await Promise.all([
    postDocCollection.distinct('author'),
    postDocCollection.distinct('tags'),
    postDocCollection.distinct('ucs.maker' as any) as Promise<string[]>,
    postDocCollection.distinct('song._id' as any) as Promise<string[]>,
  ]);

  await Promise.all([
    postParamDocCollection.updateOne({ _id: 'author' }, { $set: { params: authors } }, { upsert: true }),
    postParamDocCollection.updateOne({ _id: 'tag' }, { $set: { params: tags } }, { upsert: true }),
    postParamDocCollection.updateOne({ _id: 'ucs.maker' }, { $set: { params: makers } }, { upsert: true }),
    postParamDocCollection.updateOne({ _id: 'song._id' }, { $set: { params: songs } }, { upsert: true }),
  ]);
}

export async function postParamList(ctx: ApiContext) {
  return postParamDocCollection.findToArray({}, {});
}

function filteringHTML(str: string) {
  return sanitizeHtml(str, {
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      img: ['src'],
      span: ['style'],
    },
    allowedStyles: {
      '*': {
        // Match HEX and RGB
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/],
        // Match any number with px, em, or %
        'font-size': [/^\d+(?:px|em|%)$/]
      },
      'p': {
        'font-size': [/^\d+rem$/]
      }
    }
  });
}