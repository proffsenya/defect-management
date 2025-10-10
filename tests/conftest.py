"""
Конфигурация pytest для проекта flare-lab
"""
import pytest
import requests
import time
import subprocess
import os
import signal
import sys
from pathlib import Path

# Базовый URL для API
BASE_URL = "http://localhost:8080"
API_BASE = f"{BASE_URL}/api"

@pytest.fixture(scope="session")
def server_process():
    """Запуск сервера для тестов"""
    # Проверяем, что мы в корневой директории проекта
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Запускаем сервер в фоновом режиме
    process = subprocess.Popen(
        ["node", "server/simple-server.js"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid if os.name != 'nt' else None
    )
    
    # Ждем запуска сервера
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{BASE_URL}/api/projects", timeout=2)
            if response.status_code in [200, 401]:  # 401 - нормально, нужна авторизация
                break
        except requests.exceptions.RequestException:
            pass
        time.sleep(1)
    else:
        process.terminate()
        pytest.fail("Сервер не запустился в течение 30 секунд")
    
    yield process
    
    # Останавливаем сервер
    try:
        if os.name != 'nt':
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        else:
            process.terminate()
        process.wait(timeout=5)
    except (ProcessLookupError, subprocess.TimeoutExpired):
        try:
            if os.name != 'nt':
                os.killpg(os.getpgid(process.pid), signal.SIGKILL)
            else:
                process.kill()
        except ProcessLookupError:
            pass

@pytest.fixture
def auth_headers():
    """Получение заголовков авторизации для тестов"""
    # Регистрируем тестового пользователя
    test_user = {
        "email": "test@example.com",
        "password": "test123",
        "role": "engineer"
    }
    
    # Сначала пытаемся зарегистрироваться
    try:
        response = requests.post(f"{API_BASE}/register", json=test_user)
        if response.status_code not in [201, 409]:  # 409 - пользователь уже существует
            print(f"Ошибка регистрации: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Ошибка при регистрации: {e}")
    
    # Логинимся
    login_data = {
        "email": test_user["email"],
        "password": test_user["password"]
    }
    
    response = requests.post(f"{API_BASE}/login", json=login_data)
    if response.status_code == 200:
        user_data = response.json()["user"]
        return {"Authorization": f"Bearer {user_data['id']}"}
    else:
        print(f"Ошибка логина: {response.status_code} - {response.text}")
        return {}

@pytest.fixture
def admin_headers():
    """Получение заголовков авторизации для админа"""
    # Используем предустановленного админа
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{API_BASE}/login", json=login_data)
    if response.status_code == 200:
        user_data = response.json()["user"]
        return {"Authorization": f"Bearer {user_data['id']}"}
    else:
        print(f"Ошибка логина админа: {response.status_code} - {response.text}")
        return {}

def pytest_configure(config):
    """Настройка pytest"""
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )

def pytest_collection_modifyitems(config, items):
    """Автоматическая маркировка тестов"""
    for item in items:
        if "test_unit_" in item.name:
            item.add_marker(pytest.mark.unit)
        elif "test_integration_" in item.name:
            item.add_marker(pytest.mark.integration)
