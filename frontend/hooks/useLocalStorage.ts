import { useState, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Usamos una referencia para tener siempre el valor más reciente sin recrear la función
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Calculamos el nuevo valor de forma síncrona
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
      
      // Intentamos guardar en la "base de datos" (localStorage) primero
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
      
      // Si tiene éxito, actualizamos el estado de React
      setStoredValue(valueToStore);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
      // Lanzamos el error para que pueda ser capturado por la interfaz (ej. modal de usuario)
      throw new Error(`Error de almacenamiento: ${(error as Error).message}`);
    }
  }, [key]);

  return [storedValue, setValue];
}
