import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook personnalisé pour gérer les appels API avec gestion d'état de chargement et d'erreur
 */
export function useApi<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    data,
    isLoading,
    error,
    execute
  };
}

/**
 * Hook pour gérer les opérations CRUD avec feedback utilisateur
 */
export function useCrudApi<T, CreateData, UpdateData>(
  api: {
    getAll: (params?: any) => Promise<{ items: T[]; total: number }>;
    getById: (id: string) => Promise<T>;
    create: (data: CreateData) => Promise<T>;
    update: (id: string, data: UpdateData) => Promise<T>;
    delete: (id: string) => Promise<boolean>;
  },
  options?: {
    successMessages?: {
      create?: string;
      update?: string;
      delete?: string;
    };
    errorMessages?: {
      create?: string;
      update?: string;
      delete?: string;
    };
  }
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const successMessages = {
    create: options?.successMessages?.create || 'Élément créé avec succès',
    update: options?.successMessages?.update || 'Élément mis à jour avec succès',
    delete: options?.successMessages?.delete || 'Élément supprimé avec succès'
  };

  const errorMessages = {
    create: options?.errorMessages?.create || 'Erreur lors de la création',
    update: options?.errorMessages?.update || 'Erreur lors de la mise à jour',
    delete: options?.errorMessages?.delete || 'Erreur lors de la suppression'
  };

  const fetchItems = useCallback(async (params?: any) => {
    setIsLoading(true);
    setError(null);
    console.log('Fetching items with params:', params);
    try {
      const result = await api.getAll(params);
      console.log('Result from api.getAll in useCrudApi fetchItems:', result);

      setItems(result.items);
      console.log('setItems called with:', result.items);
      setTotal(result.total || 0);
      console.log('setTotal called with:', result.total || 0);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error fetching items in useCrudApi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const fetchItemById = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await api.getById(id);
        setSelectedItem(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const createItem = useCallback(
    async (data: CreateData) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await api.create(data);
        setItems(prevItems => [...prevItems, result]);
        toast.success(successMessages.create);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(errorMessages.create);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [api, successMessages.create, errorMessages.create]
  );

  const updateItem = useCallback(
    async (id: string, data: UpdateData) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await api.update(id, data);
        setItems(prevItems => 
          prevItems.map(item => 
            // @ts-ignore - Nous supposons que l'item a un id
            item._id === id ? result : item
          )
        );
        if (selectedItem && typeof selectedItem === 'object' && '_id' in selectedItem && selectedItem._id === id) {
          setSelectedItem(result);
        }
        toast.success(successMessages.update);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(errorMessages.update);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedItem, successMessages.update, errorMessages.update]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      
      try {
        await api.delete(id);
        setItems(prevItems => 
          // @ts-ignore - Nous supposons que l'item a un id
          prevItems.filter(item => item._id !== id)
        );
        if (selectedItem && typeof selectedItem === 'object' && '_id' in selectedItem && selectedItem._id === id) {
          setSelectedItem(null);
        }
        toast.success(successMessages.delete);
        return true;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(errorMessages.delete);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedItem, successMessages.delete, errorMessages.delete]
  );

  return {
    items,
    total,
    selectedItem,
    isLoading,
    error,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    setSelectedItem
  };
}