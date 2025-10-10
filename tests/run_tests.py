#!/usr/bin/env python3
"""
Скрипт для запуска тестов с подробным выводом статуса
"""
import subprocess
import sys
import os
from pathlib import Path

def run_tests():
    """Запуск тестов с подробным выводом"""
    print("🚀 Запуск автотестов для проекта flare-lab")
    print("=" * 50)
    
    # Переходим в директорию проекта
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Команда для запуска pytest
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/",
        "-v",
        "--tb=short",
        "--color=yes",
        "--durations=10",
        "--html=tests/report.html",
        "--self-contained-html"
    ]
    
    print(f"📁 Рабочая директория: {os.getcwd()}")
    print(f"🔧 Команда: {' '.join(cmd)}")
    print("=" * 50)
    
    try:
        # Запускаем тесты
        result = subprocess.run(cmd, capture_output=False, text=True)
        
        print("=" * 50)
        if result.returncode == 0:
            print("✅ ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!")
        else:
            print("❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ!")
        
        print(f"📊 Код возврата: {result.returncode}")
        print(f"📄 Отчет сохранен в: tests/report.html")
        
        return result.returncode
        
    except Exception as e:
        print(f"❌ Ошибка при запуске тестов: {e}")
        return 1

def run_unit_tests():
    """Запуск только unit тестов"""
    print("🔬 Запуск unit тестов...")
    cmd = [sys.executable, "-m", "pytest", "tests/test_unit_*.py", "-v", "--color=yes"]
    return subprocess.run(cmd).returncode

def run_integration_tests():
    """Запуск только интеграционных тестов"""
    print("🔗 Запуск интеграционных тестов...")
    cmd = [sys.executable, "-m", "pytest", "tests/test_integration_*.py", "-v", "--color=yes"]
    return subprocess.run(cmd).returncode

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "unit":
            exit_code = run_unit_tests()
        elif sys.argv[1] == "integration":
            exit_code = run_integration_tests()
        else:
            print("Использование: python run_tests.py [unit|integration]")
            exit_code = 1
    else:
        exit_code = run_tests()
    
    sys.exit(exit_code)
