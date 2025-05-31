import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { IUser, UserCreateParams } from '@/models/user';
import { ObjectId } from 'mongodb';

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

export async function PUT(request: Request) {

    const apiKey = request.headers.get('api-key');

    if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
        );
    }

    try {
        const { id, ...updateData }: { id: string } & Partial<IUser> = await request.json();

        //  Validation for ID
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // validation for update fields
        if (!updateData.name && !updateData.email) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        const usersCollection = await getUsersCollection();

        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date(),
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Retrieve the updated user
        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(id) });

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'Failed to retrieve updated user' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            ...updatedUser,
            _id: updatedUser._id.toString(),
            createdAt: updatedUser.createdAt?.toISOString(),
            updatedAt: updatedUser.updatedAt?.toISOString(),
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {

    const apiKey = request.headers.get('api-key');

    if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
        );
    }

    try {
        const { id }: { id: string } = await request.json();

        // Validation for ID
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const usersCollection = await getUsersCollection();

        const deleteResult = await usersCollection.deleteOne({
            _id: new ObjectId(id),
        });

        if (deleteResult.deletedCount === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}