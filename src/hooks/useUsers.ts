import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type UserProfile = Schema['UserProfile']['type'];
type CreateUserProfileInput = Schema['UserProfile']['createType'];
type UpdateUserProfileInput = Schema['UserProfile']['updateType'];

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, errors } = await client.models.UserProfile.list();
      if (errors) {
        setError(errors.map(e => e.message).join(', '));
      } else {
        setUsers(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (input: Omit<CreateUserProfileInput, 'id'>) => {
    try {
      const { data, errors } = await client.models.UserProfile.create(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setUsers(prev => [...prev, data]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  };

  const updateUser = async (input: UpdateUserProfileInput) => {
    try {
      const { data, errors } = await client.models.UserProfile.update(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setUsers(prev => prev.map(u => u.id === data.id ? data : u));
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { errors } = await client.models.UserProfile.delete({ id });
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  };

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
}
