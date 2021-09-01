import EJSON from 'ejson';

import { delay } from '../util';

interface CmdQueueItem {
  msgId: number;
  cmdId: string;
  param: any[];
  // promise: Promise<unknown>;
  resolve(r: unknown): void;
  reject(e: unknown): void;
}

type CmdQueue = CmdQueueItem[];

function wsSend(ws: WebSocket, msgId: number, cmdId: string, param: any[]): void {
  ws.send(EJSON.stringify([msgId, cmdId, param]));
}

export class AppSocket {
  private ws: WebSocket;
  private sendQueue: CmdQueue = [];
  private recvQueue: CmdQueue = [];
  private onconnectQueue: { (): void }[] = [];
  private onloadingQueue: { (isLoading: boolean): void }[] = [];

  private isAlive = true;
  private nextId = 1;

  public constructor(private url: string) {
    this.ws = this.connect();
    const ping = () => {
      this.send('ping', []);
      setTimeout(ping, 30 * 1000);
    }

    ping();
  }

  public command(cmdId: string, param: any[]): Promise<unknown> {
    return this.send(cmdId, param);
  }

  public onconnect(fn: () => void): void {
    this.onconnectQueue.push(fn);
  }

  public onloading(fn: (isLoading: boolean) => void): void {
    this.onloadingQueue.push(fn);
  }

  private connect(): WebSocket {
    if (!this.isAlive)
      return this.ws;
    if (this.ws && WebSocket.CONNECTING == this.ws.readyState)
      return this.ws;

    const ws = new WebSocket(this.url);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      console.log('ws onopen');

      const list = this.sendQueue.splice(0);

      for (const item of list) {
        wsSend(this.ws, item.msgId, item.cmdId, item.param);
      }

      for (const fn of this.onconnectQueue) {
        fn();
      }
    }
    ws.onmessage = ev => {
      const { data } = ev;
      if (typeof data != 'string')
        throw new Error(`data type is not string ${typeof data} ${data}`);

      const [msgId, result, error] = EJSON.parse(data);
      return this.recv(msgId, result, error);
    }
    ws.onclose = ev => {
      console.warn(`ws onclose ${ev.reason} ${ev}`);
      setTimeout(() => { this.connect() }, 1000);
    }
    ws.onerror = ev => {
      console.error(`ws onerror ${ev.type} ${ev}`);
      // disconnect();
    }

    this.ws = ws;
    return ws;
  }

  public disconnect = () => this.isAlive = false;

  private send(cmdId: string, param: any[]): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      const msgId = this.nextId;
      this.nextId++;

      const item = { msgId, cmdId, param, resolve, reject };

      this.recvQueue.push(item);

      if (WebSocket.OPEN == this.ws.readyState)
        wsSend(this.ws, msgId, cmdId, param);
      else
        this.sendQueue.push(item);

      this.setLoading();
    });
  }

  private recv(msgId: number, result: unknown, error: unknown): void {
    const idx = this.recvQueue.findIndex(v => v.msgId == msgId);
    if (-1 >= idx)
      return console.log(`unknown message ${msgId} ${result} ${error}`);

    const [item] = this.recvQueue.splice(idx, 1);

    if (error) item.reject(error);
    else item.resolve(result);

    this.setLoading();
  }

  private setLoading() {
    const existsSend = !!this.sendQueue.find(v => v.cmdId != 'ping');
    const existsRecv = !!this.recvQueue.find(v => v.cmdId != 'ping');
    const isLoading = existsSend || existsRecv;

    // console.log(`isloading ${isLoading}`);

    for (const fn of this.onloadingQueue) {
      fn(isLoading);
    }
  }
}

export function createAppSocket(url: string): AppSocket {
  const r = new AppSocket(url);

  return r;
}
