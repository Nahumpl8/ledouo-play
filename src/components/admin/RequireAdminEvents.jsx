import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const RequireAdminEvents = ({ children }) => {
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Check if user has admin or admin_events role
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error checking roles:', error);
          setHasAccess(false);
        } else {
          const hasAdminRole = roles?.some(r => 
            r.role === 'admin' || r.role === 'admin_events'
          );
          setHasAccess(hasAdminRole);
        }
      } catch (err) {
        console.error('Error:', err);
        setHasAccess(false);
      }
      setLoading(false);
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAccess();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  return children;
};
