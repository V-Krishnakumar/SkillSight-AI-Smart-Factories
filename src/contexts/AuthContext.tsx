import React, { createContext, useContext, useState, useEffect } from 'react';
import { Worker } from '@/types/database';
import { WorkerService } from '@/services/workerService';

interface AuthContextType {
  worker: Worker | null;
  login: (workerId: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for stored worker session on mount
  useEffect(() => {
    const storedWorkerId = localStorage.getItem('workerId');
    const storedWorkerName = localStorage.getItem('workerName');
    
    if (storedWorkerId && storedWorkerName) {
      // Verify the stored credentials are still valid
      login(storedWorkerId, storedWorkerName);
    }
  }, []);

  const login = async (workerId: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch worker from Supabase
      const workerData = await WorkerService.getWorkerById(workerId);
      
      if (!workerData) {
        setError('Worker ID not found');
        setIsLoading(false);
        return false;
      }

      // Verify the name matches (case-insensitive)
      if (workerData.name.toLowerCase() !== name.toLowerCase()) {
        setError('Name does not match worker ID');
        setIsLoading(false);
        return false;
      }

      // Login successful
      setWorker(workerData);
      localStorage.setItem('workerId', workerId);
      localStorage.setItem('workerName', name);
      setIsLoading(false);
      return true;

    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to verify worker credentials');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setWorker(null);
    localStorage.removeItem('workerId');
    localStorage.removeItem('workerName');
    setError(null);
  };

  const value: AuthContextType = {
    worker,
    login,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
