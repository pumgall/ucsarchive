import { ApiContext } from './context';

import { LEVEL_DEFAULT, LEVEL_ADMIN } from '../types';
import { hash } from '../util';
import { userDocCollection } from '../db/UserDoc';


export function currentUserInfo(ctx: ApiContext) {
    return { id: ctx.userId, level: ctx.userLevel };
}

export async function login(ctx: ApiContext, id: string, pw: string) {
    if (ctx.userId)
        throw new Error('already logged in');

    if (!id || !pw)
        throw new Error('invalid parameter');

    const doc = await userDocCollection.findOne({ id });
    if (!doc)
        throw new Error('not exists id');

    const hashedPw = hash(pw);
    if (doc.pw !== hashedPw)
        throw new Error('not match pw');

    ctx.userId = id;
    ctx.userLevel = doc.level;

    return { id, level: doc.level };
}

export async function register(ctx: ApiContext, id: string, pw: string) {
    if (ctx.userId)
        throw new Error('already registered');

    if (!id || !pw)
        throw new Error('invalid parameter');

    if (await userDocCollection.findOne({ id }))
        throw new Error('already exists id');

    const level = LEVEL_DEFAULT;

    await userDocCollection.insertOne({
        _id: id,
        id,
        pw: hash(pw),
        level,
    });

    ctx.userId = id;
    ctx.userLevel = level;

    return { id, level };
}

export function logout(ctx: ApiContext) {
    ctx.userId = '';
    ctx.userLevel = 0;
}

export async function modifyPassword(ctx: ApiContext, oldPw: string, newPw: string) {
    const id = ctx.userId;
    if (!id)
        throw new Error('not logged in');

    if (!oldPw || !newPw)
        throw new Error('invalid parameter');

    if (oldPw == newPw)
        throw new Error('password same');

    const doc = await userDocCollection.findOne({ id });
    if (!doc)
        throw new Error('id not exists');

    const hashedOldPw = hash(oldPw);
    const hashedNewPw = hash(newPw);

    if (hashedOldPw !== doc.pw)
        throw new Error('pw not match');

    await userDocCollection.updateOne({ id }, { pw: hashedNewPw })
}

export async function modifyLevel(ctx: ApiContext, id: string, level: number) {
    if (LEVEL_ADMIN > ctx.userLevel)
        throw new Error('access denied');

    if (typeof level !== 'number')
        throw new Error('invalid parameter');

    await userDocCollection.updateOne({ id }, { $set: { level } });
}

export async function userList(ctx: ApiContext) {
    if (LEVEL_ADMIN > ctx.userLevel)
        throw new Error('access denied');

    return userDocCollection.findToArray({}, { projection: { pw: 0 } })
}