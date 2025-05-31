import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { IUser, UserCreateParams } from '@/models/user';

export async function GET() {
    try {
        const usersCollection = await getUsersCollection();
        const users = await usersCollection.find({}).toArray();

        // Convert ObjectId to string
        const usersWithStringId = users.map(user => ({
            ...user,
            _id: user._id.toString(),
        }));

        return NextResponse.json(usersWithStringId);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const userData: UserCreateParams = await request.json();

        // Basic validation
        if (!userData.name || !userData.email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }

        const usersCollection = await getUsersCollection();
        const result = await usersCollection.insertOne({
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Retrieve the newly created user
        const newUser = await usersCollection.findOne({ _id: result.insertedId });

        if (!newUser) {
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            ...newUser,
            _id: newUser._id.toString(),
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}