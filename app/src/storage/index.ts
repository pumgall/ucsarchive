import EJSON from 'ejson';

import { PostDoc } from '../common';

abstract class BaseStorage<T> {
  private cached: T | null = null;
  constructor(private key: string, private defaultValue: T) { }

  public get(): T {
    if (this.cached)
      return this.cached;

    const v = this.load();
    this.cached = v;
    return v;
  }

  private load(): T {
    const json = window.localStorage.getItem(this.key);
    if (!json)
      return this.defaultValue;

    return EJSON.parse(json) as T;
  }

  public save() {
    if (!this.cached)
      return;

    const json = EJSON.stringify(this.cached);
    window.localStorage.setItem(this.key, json);
  }
}

class CartStorage extends BaseStorage<PostDoc[]> {
  constructor() {
    super('cart', []);
  }
}

export const cartStorage = new CartStorage();