import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
 
export const SupabaseConnectionStatus: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
 
  useEffect(() => {
    let isMounted = true;
    if (isLoading || !user) return;
    const checkConnection = async () => {
      try {
        // Simple query to check if we can connect to Supabase
        const { data, error } = await supabase .from('users')
        .select('id') // just a simple column
        .limit(1);
        ///await supabase.from('users').select('count()', { count: 'exact' });
        if (!isMounted) return;
       
        if (error) {
          console.error('Supabase connection error:', error);
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          console.log('Supabase connection successful:', data);
          setStatus('connected');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };
 
    checkConnection();
    return () => {
      isMounted = false;
    };
  }, [user, isLoading]);
 
  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-md flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        <span>Checking Supabase connection...</span>
      </div>
    );
  }
 
  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-md flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <div>
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md flex items-center">
      <CheckCircle className="h-5 w-5 mr-2" />
      <span>Connected to Supabase</span>
    </div>
  );
};
 