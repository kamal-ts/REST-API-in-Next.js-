import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreateParams {
  name: string;
  email: string;
}

export interface UserUpdateParams {
  name?: string;
  email?: string;
}