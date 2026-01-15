import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type Finding = Schema['Finding']['type'];
type CreateFindingInput = Schema['Finding']['createType'];
type UpdateFindingInput = Schema['Finding']['updateType'];

export function useFindings(auditId?: string) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFindings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let result;
      if (auditId) {
        result = await client.models.Finding.list({
          filter: { auditId: { eq: auditId } }
        });
      } else {
        result = await client.models.Finding.list();
      }

      if (result.errors) {
        setError(result.errors.map(e => e.message).join(', '));
      } else {
        setFindings(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch findings');
    } finally {
      setIsLoading(false);
    }
  }, [auditId]);

  useEffect(() => {
    fetchFindings();
  }, [fetchFindings]);

  const createFinding = async (input: Omit<CreateFindingInput, 'id'>) => {
    try {
      const { data, errors } = await client.models.Finding.create(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setFindings(prev => [...prev, data]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create finding');
      throw err;
    }
  };

  const updateFinding = async (input: UpdateFindingInput) => {
    try {
      const { data, errors } = await client.models.Finding.update(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setFindings(prev => prev.map(f => f.id === data.id ? data : f));
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update finding');
      throw err;
    }
  };

  const deleteFinding = async (id: string) => {
    try {
      const { errors } = await client.models.Finding.delete({ id });
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      setFindings(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete finding');
      throw err;
    }
  };

  return {
    findings,
    isLoading,
    error,
    createFinding,
    updateFinding,
    deleteFinding,
    refetch: fetchFindings,
  };
}
