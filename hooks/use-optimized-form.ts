import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './use-debounce';

export function useOptimizedForm<T>(initialData: T, onUpdate: (data: T) => void, debounceMs = 100) {
  const [localData, setLocalData] = useState<T>(initialData);
  const debouncedData = useDebounce(localData, debounceMs);

  // Sync debounced data with parent
  useEffect(() => {
    if (JSON.stringify(debouncedData) !== JSON.stringify(initialData)) {
      onUpdate(debouncedData);
    }
  }, [debouncedData, onUpdate, initialData]);

  // Update local data when initial data changes
  useEffect(() => {
    setLocalData(initialData);
  }, [initialData]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setData = useCallback((newData: T) => {
    setLocalData(newData);
  }, []);

  return {
    data: localData,
    updateField,
    setData,
  };
}
