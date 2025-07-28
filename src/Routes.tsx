import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './hooks/useContexts';
import Nav from './components/Nav';
import { toast } from 'react-toastify';

interface RouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser();

  if (!currentUser?.id) {
    toast.info('Please Login', {
      position: 'top-right',
      autoClose: 5000,
      closeOnClick: true,
    });
    return <Navigate to='/auth/login' replace />;
  }

  return (
    <>
      <Nav />
      {children}
    </>
  );
}

export const AuthRoute: React.FC<RouteProps> = ({ children }) => {
  const { currentUser } = useUser();

  if (currentUser?.id) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};
