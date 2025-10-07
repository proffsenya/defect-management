import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Defects from "./pages/Defects";
import DefectDetail from "./pages/DefectDetail";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import NotFound from "./pages/NotFound";

// Создаём QueryClient
const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  // Если данные о статусе загрузки ещё не получены, показываем загрузку
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Загрузка...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/defects" element={
        <ProtectedRoute>
          <Defects />
        </ProtectedRoute>
      } />
      <Route path="/defects/:id" element={
        <ProtectedRoute>
          <DefectDetail />
        </ProtectedRoute>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")).render(<App />);
