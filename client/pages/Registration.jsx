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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // По умолчанию роль "user"
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Проверка, что email и пароль заполнены
    if (!email || !password || !role) {
      setError("Все поля обязательны для заполнения");
      return;
    }

    try {
      // Отправляем данные на сервер для регистрации
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Пользователь успешно зарегистрирован");

        // Перенаправляем на страницу логина через 2 секунды
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Ошибка при регистрации");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Произошла ошибка при регистрации. Попробуйте снова.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>
            Создайте новый аккаунт для доступа к системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <Select
                id="role"
                value={role}
                onValueChange={(value) => setRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь - Просмотр дефектов</SelectItem>
                  <SelectItem value="engineer">Инженер - Создание и редактирование дефектов</SelectItem>
                  <SelectItem value="manager">Менеджер - Управление проектами и назначение исполнителей</SelectItem>
                  <SelectItem value="admin">Администратор - Полный доступ ко всем функциям</SelectItem>
                  <SelectItem value="observer">Наблюдатель - Только просмотр отчетов</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Зарегистрироваться
            </Button>
          </form>

          {/* Сообщения об ошибке или успешной регистрации */}
          {error && <p className="mt-2 text-red-500 error">{error}</p>}
          {successMessage && (
            <p className="mt-2 text-green-500 success">{successMessage}</p>
          )}

          {/* Кнопка для перехода на страницу логина */}
          <div className="mt-4 text-center">
            <p>
              Уже есть аккаунт?{" "}
              <Button variant="link" onClick={() => navigate("/login")}>
                Войдите
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registration;
