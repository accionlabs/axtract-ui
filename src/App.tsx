// src/App.tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { Toaster } from "@/components/ui/toaster";
import { AppStateProvider } from '@/context/AppStateContext';

function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AppStateProvider>
  );
}

export default App;