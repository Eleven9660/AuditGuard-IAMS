import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type ActionItem = Schema['ActionItem']['type'];
type CreateActionItemInput = Schema['ActionItem']['createType'];
type UpdateActionItemInput = Schema['ActionItem']['updateType'];

export function useActionItems(findingId?: string) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActionItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let result;
      if (findingId) {
        result = await client.models.ActionItem.list({
          filter: { findingId: { eq: findingId } }
        });
      } else {
        result = await client.models.ActionItem.list();
      }

      if (result.errors) {
        setError(result.errors.map(e => e.message).join(', '));
      } else {
        setActionItems(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch action items');
    } finally {
      setIsLoading(false);
    }
  }, [findingId]);

  useEffect(() => {
    fetchActionItems();
  }, [fetchActionItems]);

  const createActionItem = async (input: Omit<CreateActionItemInput, 'id'>) => {
    try {
      const { data, errors } = await client.models.ActionItem.create(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setActionItems(prev => [...prev, data]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create action item');
      throw err;
    }
  };

  const updateActionItem = async (input: UpdateActionItemInput) => {
    try {
      const { data, errors } = await client.models.ActionItem.update(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setActionItems(prev => prev.map(a => a.id === data.id ? data : a));
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update action item');
      throw err;
    }
  };

  const deleteActionItem = async (id: string) => {
    try {
      const { errors } = await client.models.ActionItem.delete({ id });
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      setActionItems(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete action item');
      throw err;
    }
  };

  return {
    actionItems,
    isLoading,
    error,
    createActionItem,
    updateActionItem,
    deleteActionItem,
    refetch: fetchActionItems,
  };
}
