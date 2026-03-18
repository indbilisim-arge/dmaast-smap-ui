import { useState, useEffect, useCallback } from 'react';

interface UseFormMemoryOptions<T> {
  key: string;
  defaultValues: T;
  debounceMs?: number;
}

export function useFormMemory<T extends Record<string, unknown>>({
  key,
  defaultValues,
  debounceMs = 500,
}: UseFormMemoryOptions<T>) {
  const storageKey = `smap-form-${key}`;

  const [values, setValues] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return { ...defaultValues, ...JSON.parse(saved) };
      }
    } catch {
      // Fall through to default
    }
    return defaultValues;
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(values));
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [values, isDirty, storageKey, debounceMs]);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const setAllValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);

  const reset = useCallback(() => {
    setValues(defaultValues);
    setIsDirty(false);
    localStorage.removeItem(storageKey);
  }, [defaultValues, storageKey]);

  const clearMemory = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    values,
    setValue,
    setAllValues,
    reset,
    clearMemory,
    isDirty,
  };
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fall through to default
    }
    return defaultValue;
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);

  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue] as const;
}
