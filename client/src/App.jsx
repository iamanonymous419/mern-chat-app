// src/App.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';
import HomePage from './pages/Home.jsx';

const App = () => {
  const location = useLocation();
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  const publicRoutes = ['/login', '/signup', '/setting'];

  if (!authUser && !publicRoutes.includes(location.pathname)) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Navbar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
