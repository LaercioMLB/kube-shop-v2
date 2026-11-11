import { MongoClient } from "mongodb";

export class MongoOrderRepository {
  constructor(config) {
    this.client = new MongoClient(config.mongoUri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
      maxPoolSize: 10,
    });
    this.collection = this.client.db(config.database).collection("orders");
    this.db = this.client.db(config.database);
  }
  async connect() {
    await this.client.connect();
    await this.collection.createIndex({ createdAt: -1 });
  }
  async ping() {
    await this.db.command({ ping: 1 }, { timeoutMS: 1500 });
    return true;
  }
  async create(order) {
    const { insertedId } = await this.collection.insertOne(order, {
      timeoutMS: 3000,
      writeConcern: { w: 1, j: true },
    });
    return { ...order, id: insertedId.toString() };
  }
  async list() {
    return (
      await this.collection
        .find({}, { timeoutMS: 3000 })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray()
    ).map(({ _id, ...order }) => ({ ...order, id: _id.toString() }));
  }
  async close() {
    await this.client.close();
  }
}
