import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'loading:', loading, 'path:', location.pathname);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: перенаправляем на логин, сохраняем путь:', location.pathname);
    // Сохраняем текущий путь для перенаправления после входа
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: пользователь авторизован, показываем контент');
  return children;
}
