import { useState, useEffect } from "react";
import bcrypt from "bcryptjs"; // Импортируем bcryptjs для хэширования паролей

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем данные о пользователе из localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log('useAuth: загружаем пользователя из localStorage:', storedUser);
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log('useAuth: парсим пользователя:', userData);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  // Функция для логина - теперь принимает объект пользователя от сервера
  const login = (userData) => {
    console.log('useAuth: логин пользователя:', userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Функция для регистрации
  const register = (email, password, role) => {
    if (!email || !password) {
      console.error("Пароль или email не могут быть пустыми");
      return;
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Ошибка при хэшировании пароля:", err);
        return;
      }

      const newUser = {
        email,
        name: email.split("@")[0], // Извлекаем имя из email
        password: hashedPassword, // Хэшированный пароль
        role,
        loggedIn: true,
      };

      // Сохраняем нового пользователя в localStorage
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    });
  };

  // Функция для выхода
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Проверка на наличие роли
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Проверка на наличие одной из ролей
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  console.log('useAuth: текущее состояние - user:', user, 'isAuthenticated:', !!user);
  
  return {
    user,
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
    register,
  };
}
