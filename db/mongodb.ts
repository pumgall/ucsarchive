import { MongoClient, Collection, Cursor } from 'mongodb';

import { DB_URL, DB_NAME } from './consts';

let client = new MongoClient(DB_URL);

export abstract class DBCollection<T extends { [k: string]: any }> {
  private cachedCollection: Collection<T> | null = null;

  protected constructor(private name: string) { }

  async findToArray(query: Parameters<Collection<T>['find']>[0], options: Parameters<Collection<T>['find']>[1]): Promise<T[]> {
    const collection = this.getCollection();
    const cursor = await collection.find(query, options) as Cursor<T>;
    const list = await cursor.toArray();
    await cursor.close();

    return list;
  }

  async findOne(filter: Parameters<Collection<T>['findOne']>[0], options?: Parameters<Collection<T>['findOne']>[1]): Promise<T | null> {
    const collection = this.getCollection();
    return collection.findOne(filter, options) as Promise<T | null>;
  }

  async insertOne(doc: Parameters<Collection<T>['insertOne']>[0], options?: Parameters<Collection<T>['insertOne']>[1]): Promise<void> {
    const collection = this.getCollection();
    await collection.insertOne(doc, options);
  }

  async updateOne(filter: Parameters<Collection<T>['updateOne']>[0], doc: Parameters<Collection<T>['updateOne']>[1], options?: Parameters<Collection<T>['updateOne']>[2]): Promise<boolean> {
    const collection = this.getCollection();
    const r = await collection.updateOne(filter, doc, options);
    return 0 !== r.modifiedCount;
  }

  async deleteOne(filter: Parameters<Collection<T>['deleteOne']>[0], options?: Parameters<Collection<T>['deleteOne']>[1]) {
    const collection = this.getCollection();
    const r = await collection.deleteOne(filter, options);
    return 0 !== r.deletedCount;
  }

  protected getCollection(): Collection<T> {
    if (this.cachedCollection)
      return this.cachedCollection;

    const db = client.db(DB_NAME);
    const collection = db.collection<T>(this.name);

    this.cachedCollection = collection;
    return collection;
  }
}

export async function dbInit() {
  client = await MongoClient.connect(DB_URL);
}