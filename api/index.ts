import { ApiFunction } from './context';
export * from './context';

import * as ping from './ping';
import * as user from './user';
import * as post from './post';
import * as ucs from './ucs';
import * as song from './song';

export const apiSet = {
    ...ping,
    ...user,
    ...post,
    ...ucs,
    ...song,
};

const __static_assert_apiSet: {
    readonly [k: string]: ApiFunction
} = apiSet;
