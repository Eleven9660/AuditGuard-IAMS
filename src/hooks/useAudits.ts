import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type Audit = Schema['Audit']['type'];
type CreateAuditInput = Schema['Audit']['createType'];
type UpdateAuditInput = Schema['Audit']['updateType'];

export function useAudits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, errors } = await client.models.Audit.list();
      if (errors) {
        setError(errors.map(e => e.message).join(', '));
      } else {
        setAudits(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audits');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const createAudit = async (input: Omit<CreateAuditInput, 'id'>) => {
    try {
      const { data, errors } = await client.models.Audit.create(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setAudits(prev => [...prev, data]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create audit');
      throw err;
    }
  };

  const updateAudit = async (input: UpdateAuditInput) => {
    try {
      const { data, errors } = await client.models.Audit.update(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setAudits(prev => prev.map(a => a.id === data.id ? data : a));
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update audit');
      throw err;
    }
  };

  const deleteAudit = async (id: string) => {
    try {
      const { errors } = await client.models.Audit.delete({ id });
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      setAudits(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete audit');
      throw err;
    }
  };

  return {
    audits,
    isLoading,
    error,
    createAudit,
    updateAudit,
    deleteAudit,
    refetch: fetchAudits,
  };
}
