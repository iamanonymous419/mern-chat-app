import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/route.jsx';
import { useThemeStore } from './store/useThemeStore';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

function ThemeWrapper({ children }) {
  const { theme } = useThemeStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return <div data-theme={theme}>{children}</div>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeWrapper>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeWrapper>
  </StrictMode>
);
