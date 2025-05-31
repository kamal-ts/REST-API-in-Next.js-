'use client';

import { useEffect, useState } from 'react';

type User = {
    _id: string;
    name: string;
    email: string;
};

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export default function UserPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true);
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Create user
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email }),
        });

        if (res.ok) {
            setName('');
            setEmail('');
            fetchUsers();
        } else {
            alert('Failed to create user');
        }
    };

    // Update user
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUser) return;

        const res = await fetch('/api/users', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY,
            },
            body: JSON.stringify({
                id: editingUser._id,
                name,
                email,
            }),
        });

        if (res.ok) {
            setEditingUser(null);
            setName('');
            setEmail('');
            fetchUsers();
        } else {
            alert('Failed to update user');
        }
    };

    // Delete user
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        const res = await fetch('/api/users', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY,
            },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            fetchUsers();
        } else {
            alert('Failed to delete user');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setName('');
        setEmail('');
    };

    return (
        <div style={{ maxWidth: 500, margin: 'auto', padding: '1rem' }}>
            <h1>User Management</h1>

            <form onSubmit={editingUser ? handleUpdate : handleCreate}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ display: 'block', marginBottom: 8, width: '100%' }}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ display: 'block', marginBottom: 8, width: '100%' }}
                />
                <button type="submit">
                    {editingUser ? 'Update User' : 'Create User'}
                </button>
                {editingUser && (
                    <button type="button" onClick={handleCancelEdit} style={{ marginLeft: 8 }}>
                        Cancel
                    </button>
                )}
            </form>

            <hr style={{ margin: '2rem 0' }} />

            {loading ? (
                <p>Loading users...</p>
            ) : users.length === 0 ? (
                <p>No users found</p>
            ) : (
                <ul>
                    {users.map((user) => (
                        <li key={user._id} style={{ marginBottom: 10 }}>
                            <strong>{user.name}</strong> – {user.email}
                            <div>
                                <button onClick={() => handleEdit(user)}>Edit</button>
                                <button onClick={() => handleDelete(user._id)} style={{ marginLeft: 8 }}>
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
