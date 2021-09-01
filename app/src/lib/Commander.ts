import { AppSocket } from './AppSocket';

import { apiSet } from '../common';
type apis = typeof apiSet;
type methods = keyof apis;

// [k: string]: {(...param: any): Promise<any>};

// export type Commander = Proxy
type unPromise<T> = T extends Promise<infer R> ? R : T;
type omitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

export type Commander = {
    readonly [k in methods]: (
        ...arg: Parameters<omitFirstArg<apis[k]>>
    ) => Promise<unPromise<ReturnType<apis[k]>>>;
};

function api<k extends methods>(socket: AppSocket, cmdId: k, param: any[]) {
    return socket.command(cmdId, param) as Promise<unPromise<ReturnType<apis[k]>>>;
}

export function newCommander(socket: AppSocket): Commander {
    return new Proxy({}, {
        get(target, prop: methods, receiver: any) {
            return (...param: any) => api(socket, prop, param);
        }
    }) as Commander;
}
