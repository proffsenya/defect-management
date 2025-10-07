import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth"; // Импортируем хук useAuth

export default function Login() {
  const { login } = useAuth(); // Используем login из хука useAuth
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // Для вывода ошибок
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем страницу, на которую нужно перенаправить после входа
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Email и пароль обязательны для заполнения");
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешный вход
        login(data.user);  // Используем хук для установки пользователя
        localStorage.setItem("user", JSON.stringify(data.user)); // Сохраняем пользователя в localStorage
        navigate(from, { replace: true }); // Перенаправление на нужную страницу
      } else {
        setError(data.message || "Ошибка авторизации");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Произошла ошибка при входе. Попробуйте снова.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход в систему</CardTitle>
          <CardDescription>
            Войдите в систему управления дефектами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>


            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>

          {/* Кнопка для перехода на страницу регистрации */}
          <div className="mt-4 text-center">
            <p>
              Нет аккаунта?{" "}
              <Button variant="link" onClick={() => navigate("/register")}>
                Зарегистрируйтесь
              </Button>
            </p>
          </div>

          {/* Сообщение об ошибке */}
          {error && <p className="mt-2 text-red-500">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
