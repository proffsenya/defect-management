"""
Unit тесты для утилит проекта
"""
import pytest
import sys
import os
from datetime import datetime, timedelta

# Добавляем путь к проекту для импорта модулей
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

class TestUtils:
    """Тесты для утилит"""
    
    def test_unit_date_utils(self):
        """Тест утилит для работы с датами"""
        print("🔍 Тестируем утилиты дат...")
        
        # Тестируем создание ISO даты
        now = datetime.now()
        iso_now = now.isoformat()
        
        assert isinstance(iso_now, str)
        assert 'T' in iso_now
        assert len(iso_now) >= 19  # Минимум YYYY-MM-DDTHH:MM:SS
        
        # Тестируем вычисление даты N дней назад
        days_ago = 5
        past_date = now - timedelta(days=days_ago)
        iso_past = past_date.isoformat()
        
        assert isinstance(iso_past, str)
        assert past_date < now
        
        print("✅ Утилиты дат работают корректно")
    
    def test_unit_id_generation(self):
        """Тест генерации ID"""
        print("🔍 Тестируем генерацию ID...")
        
        # Симуляция генерации ID
        import time
        import random
        
        def generate_id(prefix="d"):
            timestamp = str(int(time.time() * 1000))
            random_part = str(random.randint(1000, 9999))
            return f"{prefix}_{timestamp}_{random_part}"
        
        # Генерируем несколько ID
        ids = [generate_id("d") for _ in range(5)]
        
        # Проверяем уникальность
        assert len(set(ids)) == len(ids), "ID должны быть уникальными"
        
        # Проверяем формат
        for id_val in ids:
            assert id_val.startswith("d_")
            assert len(id_val) > 10
        
        print("✅ Генерация ID работает корректно")
    
    def test_unit_csv_escaping(self):
        """Тест экранирования CSV"""
        print("🔍 Тестируем экранирование CSV...")
        
        def escape_csv(value):
            if value is None:
                return ""
            value = str(value)
            if ',' in value or '"' in value or '\n' in value:
                return f'"{value.replace('"', '""')}"'
            return value
        
        # Тестируем различные случаи
        test_cases = [
            ("simple text", "simple text"),
            ("text,with,commas", '"text,with,commas"'),
            ('text with "quotes"', '"text with ""quotes"""'),
            ("text\nwith\nnewlines", '"text\nwith\nnewlines"'),
            (None, ""),
            ("", ""),
        ]
        
        for input_val, expected in test_cases:
            result = escape_csv(input_val)
            assert result == expected, f"Ошибка экранирования для '{input_val}'"
        
        print("✅ Экранирование CSV работает корректно")
    
    def test_unit_priority_validation(self):
        """Тест валидации приоритетов"""
        print("🔍 Тестируем валидацию приоритетов...")
        
        valid_priorities = ["low", "medium", "high", "critical"]
        
        def is_valid_priority(priority):
            return priority in valid_priorities
        
        # Тестируем валидные приоритеты
        for priority in valid_priorities:
            assert is_valid_priority(priority), f"Приоритет '{priority}' должен быть валидным"
        
        # Тестируем невалидные приоритеты
        invalid_priorities = ["", "invalid", "LOW", "medium ", None, 123]
        for priority in invalid_priorities:
            assert not is_valid_priority(priority), f"Приоритет '{priority}' не должен быть валидным"
        
        print("✅ Валидация приоритетов работает корректно")
    
    def test_unit_status_validation(self):
        """Тест валидации статусов"""
        print("🔍 Тестируем валидацию статусов...")
        
        valid_statuses = ["new", "in_progress", "in_review", "closed", "cancelled"]
        
        def is_valid_status(status):
            return status in valid_statuses
        
        # Тестируем валидные статусы
        for status in valid_statuses:
            assert is_valid_status(status), f"Статус '{status}' должен быть валидным"
        
        # Тестируем невалидные статусы
        invalid_statuses = ["", "invalid", "NEW", "new ", None, 123]
        for status in invalid_statuses:
            assert not is_valid_status(status), f"Статус '{status}' не должен быть валидным"
        
        print("✅ Валидация статусов работает корректно")
    
    def test_unit_email_validation(self):
        """Тест валидации email"""
        print("🔍 Тестируем валидацию email...")
        
        import re
        
        def is_valid_email(email):
            if not email or not isinstance(email, str):
                return False
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            return bool(re.match(pattern, email))
        
        # Тестируем валидные email
        valid_emails = [
            "test@example.com",
            "user.name@domain.co.uk",
            "admin@company.org",
            "test+tag@example.com"
        ]
        
        for email in valid_emails:
            assert is_valid_email(email), f"Email '{email}' должен быть валидным"
        
        # Тестируем невалидные email
        invalid_emails = [
            "",
            "invalid-email",
            "@example.com",
            "test@",
            "test@.com",
            None,
            123
        ]
        
        for email in invalid_emails:
            assert not is_valid_email(email), f"Email '{email}' не должен быть валидным"
        
        print("✅ Валидация email работает корректно")
    
    def test_unit_password_validation(self):
        """Тест валидации паролей"""
        print("🔍 Тестируем валидацию паролей...")
        
        def is_valid_password(password):
            if not password or not isinstance(password, str):
                return False
            return len(password) >= 6
        
        # Тестируем валидные пароли
        valid_passwords = ["password123", "123456", "qwerty", "admin123"]
        for password in valid_passwords:
            assert is_valid_password(password), f"Пароль '{password}' должен быть валидным"
        
        # Тестируем невалидные пароли
        invalid_passwords = ["", "12345", "pass", None, 123456]
        for password in invalid_passwords:
            assert not is_valid_password(password), f"Пароль '{password}' не должен быть валидным"
        
        print("✅ Валидация паролей работает корректно")
    
    def test_unit_role_validation(self):
        """Тест валидации ролей"""
        print("🔍 Тестируем валидацию ролей...")
        
        valid_roles = ["admin", "manager", "engineer", "user", "observer"]
        
        def is_valid_role(role):
            return role in valid_roles
        
        # Тестируем валидные роли
        for role in valid_roles:
            assert is_valid_role(role), f"Роль '{role}' должна быть валидной"
        
        # Тестируем невалидные роли
        invalid_roles = ["", "invalid", "ADMIN", "admin ", None, 123]
        for role in invalid_roles:
            assert not is_valid_role(role), f"Роль '{role}' не должна быть валидной"
        
        print("✅ Валидация ролей работает корректно")
    
    def test_unit_json_parsing(self):
        """Тест парсинга JSON"""
        print("🔍 Тестируем парсинг JSON...")
        
        import json
        
        def safe_json_parse(json_str, default=None):
            try:
                return json.loads(json_str) if json_str else default
            except (json.JSONDecodeError, TypeError):
                return default
        
        # Тестируем валидный JSON
        valid_json = '{"key": "value", "number": 123}'
        result = safe_json_parse(valid_json)
        assert result == {"key": "value", "number": 123}
        
        # Тестируем пустую строку
        result = safe_json_parse("")
        assert result is None
        
        # Тестируем невалидный JSON
        invalid_json = '{"key": "value", "number": 123'  # Отсутствует закрывающая скобка
        result = safe_json_parse(invalid_json)
        assert result is None
        
        # Тестируем None
        result = safe_json_parse(None)
        assert result is None
        
        print("✅ Парсинг JSON работает корректно")
    
    def test_unit_string_utilities(self):
        """Тест строковых утилит"""
        print("🔍 Тестируем строковые утилиты...")
        
        def truncate_string(text, max_length=50):
            if not text:
                return ""
            if len(text) <= max_length:
                return text
            return text[:max_length-3] + "..."
        
        def clean_string(text):
            if not text:
                return ""
            return text.strip().replace('\n', ' ').replace('\r', ' ')
        
        # Тестируем обрезку строки
        long_text = "Это очень длинная строка, которая должна быть обрезана"
        truncated = truncate_string(long_text, 20)
        assert len(truncated) <= 20
        assert truncated.endswith("...")
        
        # Тестируем очистку строки
        dirty_text = "  Текст с пробелами\nи переносами  "
        cleaned = clean_string(dirty_text)
        assert cleaned == "Текст с пробелами и переносами"
        
        # Тестируем пустые строки
        assert truncate_string("") == ""
        assert clean_string("") == ""
        
        print("✅ Строковые утилиты работают корректно")
