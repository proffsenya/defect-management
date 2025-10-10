# Автотесты для проекта flare-lab

Этот каталог содержит автотесты для системы управления дефектами flare-lab.

## Структура тестов

- `simple_test.py` - 10 unit тестов для утилит и вспомогательных функций
- `simple_integration_test.py` - 5 интеграционных тестов для API endpoints
- `run_all_tests.py` - скрипт для запуска всех тестов
- `conftest.py` - конфигурация pytest и фикстуры (для расширенных тестов)
- `pytest.ini` - настройки pytest
- `run_tests.py` - скрипт для запуска тестов с pytest

## Установка зависимостей

```bash
pip install -r requirements.txt
```

## Запуск тестов

### Все тесты (рекомендуется)
```bash
python3 tests/run_all_tests.py
```

### Только unit тесты
```bash
python3 tests/simple_test.py
```

### Только интеграционные тесты
```bash
python3 tests/simple_integration_test.py
```

### Через pytest (требует установки зависимостей)
```bash
pip install -r requirements.txt
pytest tests/ -v
```

## Описание тестов

### Unit тесты (10 тестов)
1. **test_unit_date_utils** - тест утилит для работы с датами
2. **test_unit_id_generation** - тест генерации уникальных ID
3. **test_unit_csv_escaping** - тест экранирования CSV данных
4. **test_unit_priority_validation** - тест валидации приоритетов
5. **test_unit_status_validation** - тест валидации статусов
6. **test_unit_email_validation** - тест валидации email адресов
7. **test_unit_password_validation** - тест валидации паролей
8. **test_unit_role_validation** - тест валидации ролей пользователей
9. **test_unit_json_parsing** - тест парсинга JSON данных
10. **test_unit_string_utilities** - тест строковых утилит

### Интеграционные тесты (5 тестов)
1. **test_integration_user_registration_and_login** - тест регистрации и входа пользователей
2. **test_integration_defect_crud_operations** - тест CRUD операций с дефектами
3. **test_integration_defect_filtering_and_pagination** - тест фильтрации и пагинации
4. **test_integration_projects_and_statistics** - тест получения проектов и статистики
5. **test_integration_authentication_and_authorization** - тест аутентификации и авторизации

## Особенности

- Каждый тест выводит свой статус (✅ OK или ❌ НЕ OK)
- Тесты автоматически запускают сервер для интеграционных тестов
- Генерируется HTML отчет в `tests/report.html`
- Поддержка покрытия кода
- Цветной вывод в терминале

## Требования

- Python 3.7+
- Node.js (для запуска сервера)
- Установленные зависимости из requirements.txt
