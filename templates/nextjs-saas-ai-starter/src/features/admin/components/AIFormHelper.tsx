'use client';

/**
 * AI Form Helper Component
 *
 * Button and UI for AI-powered form auto-completion
 */

import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast';

export type AIFormType =
  | 'skill'
  | 'capability'
  | 'roadmap'
  | 'okr'
  | 'knowledge_doc'
  | 'invite'
  | 'track_goal'
  | 'track_route'
  | 'track_play'
  | 'track_note'
  | 'track_issue'
  | 'account_profile';

interface AIFormHelperProps<T extends object = Record<string, unknown>> {
  formType: AIFormType;
  currentData: T;
  onSuggestions: (suggestions: Partial<T>) => void;
  tenantSlug: string;
}

export function AIFormHelper<T extends object = Record<string, unknown>>({
  formType,
  currentData,
  onSuggestions,
  tenantSlug,
}: AIFormHelperProps<T>) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAIComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/ai-form-helper/${formType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          partialData: currentData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      if (data.suggestions) {
        onSuggestions(data.suggestions);
        toast({
          title: 'AI Suggestions Applied',
          description: 'Form fields have been updated with AI suggestions. Review and adjust as needed.',
        });
      }
    } catch (error) {
      console.error('AI form helper error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleAIComplete} disabled={loading} className="gap-2">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Auto-Complete with AI
        </>
      )}
    </Button>
  );
}
