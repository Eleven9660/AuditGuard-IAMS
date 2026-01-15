import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type AuditTemplate = Schema['AuditTemplate']['type'];
type CreateAuditTemplateInput = Schema['AuditTemplate']['createType'];
type UpdateAuditTemplateInput = Schema['AuditTemplate']['updateType'];

export function useTemplates() {
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, errors } = await client.models.AuditTemplate.list();
      if (errors) {
        setError(errors.map(e => e.message).join(', '));
      } else {
        setTemplates(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (input: Omit<CreateAuditTemplateInput, 'id'>) => {
    try {
      const { data, errors } = await client.models.AuditTemplate.create(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setTemplates(prev => [...prev, data]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    }
  };

  const updateTemplate = async (input: UpdateAuditTemplateInput) => {
    try {
      const { data, errors } = await client.models.AuditTemplate.update(input);
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setTemplates(prev => prev.map(t => t.id === data.id ? data : t));
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { errors } = await client.models.AuditTemplate.delete({ id });
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

  return {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}
