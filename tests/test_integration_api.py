"""
Интеграционные тесты для API endpoints
"""
import pytest
import requests
import json
import time

class TestIntegrationAPI:
    """Интеграционные тесты API"""
    
    def test_integration_user_registration_and_login(self, server_process, auth_headers):
        """Тест регистрации и входа пользователя"""
        print("🔍 Тестируем регистрацию и вход пользователя...")
        
        # Тест регистрации нового пользователя
        new_user = {
            "email": "integration_test@example.com",
            "password": "test123",
            "role": "engineer"
        }
        
        response = requests.post("http://localhost:8080/api/register", json=new_user)
        assert response.status_code in [201, 409], f"Ошибка регистрации: {response.status_code} - {response.text}"
        
        # Тест входа
        login_data = {
            "email": new_user["email"],
            "password": new_user["password"]
        }
        
        response = requests.post("http://localhost:8080/api/login", json=login_data)
        assert response.status_code == 200, f"Ошибка входа: {response.status_code} - {response.text}"
        
        user_data = response.json()["user"]
        assert user_data["email"] == new_user["email"]
        assert user_data["role"] == new_user["role"]
        
        print("✅ Регистрация и вход работают корректно")
    
    def test_integration_defect_crud_operations(self, server_process, auth_headers):
        """Тест CRUD операций с дефектами"""
        print("🔍 Тестируем CRUD операции с дефектами...")
        
        # Создание дефекта
        new_defect = {
            "projectId": "p1",
            "title": "Интеграционный тест дефекта",
            "description": "Описание для интеграционного теста",
            "priority": "high",
            "assigneeId": "u2",
            "dueDate": "2024-12-31T23:59:59.000Z"
        }
        
        response = requests.post(
            "http://localhost:8080/api/defects",
            json=new_defect,
            headers=auth_headers
        )
        assert response.status_code == 201, f"Ошибка создания дефекта: {response.status_code} - {response.text}"
        
        created_defect = response.json()
        defect_id = created_defect["id"]
        assert created_defect["title"] == new_defect["title"]
        assert created_defect["status"] == "new"
        
        # Получение дефекта
        response = requests.get(
            f"http://localhost:8080/api/defects/{defect_id}",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Ошибка получения дефекта: {response.status_code} - {response.text}"
        
        retrieved_defect = response.json()
        assert retrieved_defect["id"] == defect_id
        assert retrieved_defect["title"] == new_defect["title"]
        
        # Обновление дефекта
        update_data = {
            "title": "Обновленный заголовок",
            "priority": "critical",
            "status": "in_progress"
        }
        
        response = requests.patch(
            f"http://localhost:8080/api/defects/{defect_id}",
            json=update_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Ошибка обновления дефекта: {response.status_code} - {response.text}"
        
        updated_defect = response.json()
        assert updated_defect["title"] == update_data["title"]
        assert updated_defect["priority"] == update_data["priority"]
        
        print("✅ CRUD операции с дефектами работают корректно")
    
    def test_integration_defect_filtering_and_pagination(self, server_process, auth_headers):
        """Тест фильтрации и пагинации дефектов"""
        print("🔍 Тестируем фильтрацию и пагинацию дефектов...")
        
        # Тест получения всех дефектов
        response = requests.get(
            "http://localhost:8080/api/defects",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Ошибка получения дефектов: {response.status_code} - {response.text}"
        
        defects_data = response.json()
        assert "items" in defects_data
        assert "total" in defects_data
        assert "page" in defects_data
        assert "pageSize" in defects_data
        
        # Тест фильтрации по статусу
        response = requests.get(
            "http://localhost:8080/api/defects?status=new",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Ошибка фильтрации по статусу: {response.status_code} - {response.text}"
        
        filtered_defects = response.json()
        for defect in filtered_defects["items"]:
            assert defect["status"] == "new"
        
        # Тест фильтрации по приоритету
        response = requests.get(
            "http://localhost:8080/api/defects?priority=high",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Ошибка фильтрации по приоритету: {response.status_code} - {response.text}"
        
        # Тест пагинации
        response = requests.get(
            "http://localhost:8080/api/defects?page=1&pageSize=5",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Ошибка пагинации: {response.status_code} - {response.text}"
        
        paginated_defects = response.json()
        assert len(paginated_defects["items"]) <= 5
        assert paginated_defects["page"] == 1
        assert paginated_defects["pageSize"] == 5
        
        print("✅ Фильтрация и пагинация работают корректно")
    
    def test_integration_projects_and_statistics(self, server_process, auth_headers):
        """Тест получения проектов и статистики"""
        print("🔍 Тестируем получение проектов и статистики...")
        
        # Тест получения проектов
        response = requests.get(
            "http://localhost:8080/api/projects",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Ошибка получения проектов: {response.status_code} - {response.text}"
        
        projects = response.json()
        assert isinstance(projects, list)
        assert len(projects) > 0
        
        # Проверяем структуру проекта
        project = projects[0]
        assert "id" in project
        assert "name" in project
        assert "code" in project
        assert "location" in project
        assert "stages" in project
        
        # Тест получения статистики
        response = requests.get(
            "http://localhost:8080/api/defects/stats",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Ошибка получения статистики: {response.status_code} - {response.text}"
        
        stats = response.json()
        assert "byStatus" in stats
        assert "byPriority" in stats
        assert "monthlyCreated" in stats
        
        # Проверяем структуру статистики
        assert isinstance(stats["byStatus"], dict)
        assert isinstance(stats["byPriority"], dict)
        assert isinstance(stats["monthlyCreated"], list)
        
        print("✅ Получение проектов и статистики работает корректно")
    
    def test_integration_authentication_and_authorization(self, server_process, admin_headers):
        """Тест аутентификации и авторизации"""
        print("🔍 Тестируем аутентификацию и авторизацию...")
        
        # Тест доступа к защищенному endpoint без авторизации
        response = requests.get("http://localhost:8080/api/projects")
        assert response.status_code == 401, f"Endpoint должен требовать авторизацию: {response.status_code}"
        
        # Тест доступа с валидной авторизацией
        response = requests.get(
            "http://localhost:8080/api/projects",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Доступ с авторизацией должен работать: {response.status_code}"
        
        # Тест доступа к админскому endpoint
        response = requests.get(
            "http://localhost:8080/api/users",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Админский endpoint должен быть доступен: {response.status_code}"
        
        users = response.json()
        assert isinstance(users, list)
        
        # Тест доступа к инженерскому endpoint
        response = requests.get(
            "http://localhost:8080/api/users/engineers",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Endpoint инженеров должен быть доступен: {response.status_code}"
        
        engineers = response.json()
        assert isinstance(engineers, list)
        
        print("✅ Аутентификация и авторизация работают корректно")
