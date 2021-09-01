import express from 'express';
import http from 'http';
import websocket from 'ws';
import EJSON from 'ejson';

import { ApiContext, apiSet } from './api';
import { dbInit } from './db/mongodb';

// msgId, cmdId, param
type CommandReq = [number, string, unknown[]];

// msgId, result, error
type CommandRes = [number, unknown, unknown];

const port = 8181;

async function main() {
    await dbInit();
    runServer();
}

function runServer() {
    const app = express();
    const server = http.createServer(app);
    const wss = new websocket.Server({ server });

    
    wss.on('connection', (ws, req) => {
        const ctx: ApiContext = { 
            userId: '', 
            userLevel: 0,
         };
        
        ws.on('message', async v => msgRecv(ws, v, ctx));
    });

    server.listen(port, () => {
        console.log(`start ${port}`);
    });
}

async function msgRecv(socket: websocket, msg: websocket.Data, ctx: ApiContext): Promise<void> {
    if (typeof msg != 'string')
        return console.warn(`unknown type ${typeof msg} ${msg}`);

    const param = EJSON.parse(msg) as CommandReq;
    if (!param?.length)
        return console.warn(`param is empty? ${msg}`);

    const [msgId, cmdId, cmdParam] = param;
    if (!msgId)
        return console.warn(`msgId is null? ${msg}`);

    return msgHandler(socket, msgId, cmdId, cmdParam, ctx);
}

async function msgHandler(socket: websocket, msgId: number, cmdId: string, cmdParam: unknown[], ctx: ApiContext): Promise<void> {
    const apis = apiSet as any;

    try {
        const cmd = apis[cmdId];
        if (!cmd)
            throw new Error(`unknown cmd ${cmdId}`);

        const r = cmd(ctx, ...cmdParam);
        if (r instanceof Promise) {
            return r
                .then(v => msgSendResult(socket, msgId, v, null))
                .catch(e => msgSendResult(socket, msgId, null, `server error ${e?.message} \n${e?.stack}`));
        }

        msgSendResult(socket, msgId, r, null);
    }
    catch (e) {
        msgSendResult(socket, msgId, null, `server error ${e?.message} \n${e?.stack}`);
    }
}

function msgSendResult(socket: websocket, msgId: number, result: unknown, error: unknown): void {
    const r: CommandRes = [msgId, result, error];
    socket.send(EJSON.stringify(r));
}

main().catch(e => {
    console.error(e);
});