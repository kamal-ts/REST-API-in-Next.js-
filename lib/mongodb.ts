import { IUser } from '@/models/user';
import { MongoClient, MongoClientOptions } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI as string;
const options: MongoClientOptions = {
  maxPoolSize: 15,
  minPoolSize: 3,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 5000,
  waitQueueTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Please define MONGODB_URI in your environment variables');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to cache the MongoClient
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new MongoClient instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getUsersCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<IUser>('users');
}