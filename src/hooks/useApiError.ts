import { useState } from 'react';
import { toast } from 'react-toastify';
import { extractErrorMessage } from '@/lib/http';

interface ApiError {
  message: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
}

export function useApiError() {
  const [errors, setErrors] = useState<ApiError | null>(null);

  const handleError = (error: any) => {
    const message = extractErrorMessage(error);
    const status = error.response?.status;
    
    // Extract field-specific errors
    const fieldErrors = error.response?.data && typeof error.response.data === 'object'
      ? Object.entries(error.response.data)
          .filter(([key]) => key !== 'non_field_errors' && key !== 'detail')
          .reduce((acc, [key, value]) => {
            acc[key] = Array.isArray(value) ? value : [String(value)];
            return acc;
          }, {} as Record<string, string[]>)
      : undefined;

    const apiError: ApiError = {
      message,
      fieldErrors,
      status,
    };

    setErrors(apiError);
    
    // Show toast for non-field errors
    if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
      toast.error(message);
    }

    return apiError;
  };

  const clearErrors = () => setErrors(null);

  const getFieldError = (field: string) => {
    return errors?.fieldErrors?.[field]?.[0];
  };

  return {
    errors,
    handleError,
    clearErrors,
    getFieldError,
  };
}