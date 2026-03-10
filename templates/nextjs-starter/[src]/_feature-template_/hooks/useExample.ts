'use client';

import { useState } from 'react';
import { doSomething as doSomethingService } from '../services';

export const useExample = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSomething = async (value: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await doSomethingService(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { doSomething, isLoading, error };
};
