import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface UseFormStateReturn {
  state: FormState;
  error: string | null;
  success: string | null;
  setLoading: () => void;
  setError: (message: string) => void;
  setSuccess: (message: string) => void;
  reset: () => void;
}

export function useFormState(): UseFormStateReturn {
  const [state, setState] = useState<FormState>('idle');
  const [error, setErrorState] = useState<string | null>(null);
  const [success, setSuccessState] = useState<string | null>(null);

  const setLoading = () => {
    setState('loading');
    setErrorState(null);
    setSuccessState(null);
  };

  const setError = (message: string) => {
    setState('error');
    setErrorState(message);
    setSuccessState(null);
  };

  const setSuccess = (message: string) => {
    setState('success');
    setErrorState(null);
    setSuccessState(message);
  };

  const reset = () => {
    setState('idle');
    setErrorState(null);
    setSuccessState(null);
  };

  return {
    state,
    error,
    success,
    setLoading,
    setError,
    setSuccess,
    reset,
  };
}
